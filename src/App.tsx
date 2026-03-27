import { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useParams, Navigate, useLocation } from 'react-router-dom';
import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';
import experiencesData from './data/experiences.json';
import { type Experience } from './components/ExperienceCard';
import ConsentModal from './components/ConsentModal';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AgentNotification from './components/AgentNotification';
import './App.css';

// Constants
const AMPLITUDE_API_KEY = '8bec9c3f125852ad9987c115aa72965f';

const generateFutureWeekends = () => {
  const dates: string[] = [];
  const today = new Date();
  const toYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];
  for (let i = 1; i <= 2; i++) {
    const month = today.getMonth() + i;
    const year = today.getFullYear();
    let firstSaturday = new Date(year, month, 1);
    while (firstSaturday.getDay() !== 6) { firstSaturday.setDate(firstSaturday.getDate() + 1); }
    dates.push(toYYYYMMDD(firstSaturday));
    dates.push(toYYYYMMDD(new Date(firstSaturday.getTime() + 86400000)));
    let secondSaturday = new Date(firstSaturday.getTime() + 7 * 86400000);
    dates.push(toYYYYMMDD(secondSaturday));
    dates.push(toYYYYMMDD(new Date(secondSaturday.getTime() + 86400000)));
  }
  return dates;
};

const ProductPageWrapper = ({ experiences, wishlist, onView, onInitiateBooking, onWishlist }: any) => {
  const { id } = useParams();
  const isWishlisted = !!(id && wishlist.includes(id));
  return (
    <ProductPage 
      experiences={experiences} 
      isWishlisted={isWishlisted} 
      onView={onView} 
      onInitiateBooking={onInitiateBooking} 
      onWishlist={onWishlist} 
    />
  );
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState<any>({});
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('webmcp_demo_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [agentMessage, setAgentMessage] = useState<string | null>(null);
  const [bookingRequest, setBookingRequest] = useState<{ experience: Experience, date?: string, partySize?: number } | null>(null);
  const [lastBooking, setLastBooking] = useState<any>(() => {
    const saved = localStorage.getItem('webmcp_last_booking');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Refs for WebMCP Stability
  const wishlistRef = useRef<string[]>(wishlist);
  const filtersRef = useRef<any>(filters);
  const lastBookingRef = useRef<any>(lastBooking);
  const bookingRequestRef = useRef<any>(bookingRequest);
  const hasRegisteredTools = useRef(false);
  const amplitudeInitialized = useRef(false);

  // Sync Refs
  useEffect(() => { wishlistRef.current = wishlist; localStorage.setItem('webmcp_demo_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { 
    lastBookingRef.current = lastBooking; 
    if (lastBooking) localStorage.setItem('webmcp_last_booking', JSON.stringify(lastBooking)); 
  }, [lastBooking]);
  useEffect(() => { bookingRequestRef.current = bookingRequest; }, [bookingRequest]);

  // Global Analytics Initialization
  if (!amplitudeInitialized.current) {
    amplitudeInitialized.current = true;
    const sessionReplayTracking = sessionReplayPlugin({ sampleRate: 1.0 });
    amplitude.init(AMPLITUDE_API_KEY, undefined, { 
      defaultTracking: { pageViews: true, sessions: true, formInteractions: false, fileDownloads: false }
    });
    amplitude.add(sessionReplayTracking);
  }

  const dynamicExperiences = useMemo(() => {
    const futureDates = generateFutureWeekends();
    return (experiencesData as Experience[]).map(exp => ({
      ...exp,
      region: exp.location,
      availability: futureDates,
    }));
  }, []);

  const trackEvent = (eventName: string, properties: any, isAgent: boolean = false) => {
    if (isAgent) {
      const identifyEvent = new amplitude.Identify();
      identifyEvent.set('browser_agent_present', true);
      amplitude.identify(identifyEvent);
    }
    const globalProps = { interaction_source: isAgent ? 'AI Agent' : 'Human', webmcp_enabled: !!(navigator as any).modelContext };
    amplitude.track(eventName, { ...globalProps, ...properties });
    console.log(`[Amplitude] ${eventName}`, { ...globalProps, ...properties });
  };

  const handleSearch = (newFilters: any, isAgent: boolean = false) => {
    setFilters(newFilters);
    
    const matches = dynamicExperiences.filter(exp => {
        const matchLoc = !newFilters.location || exp.location.toLowerCase().includes(newFilters.location.toLowerCase());
        const matchParty = !newFilters.partySize || (exp.minPartySize <= newFilters.partySize && exp.maxPartySize >= newFilters.partySize);
        const matchDate = (() => {
          if (!newFilters.startDate && !newFilters.endDate) return true;
          const s = newFilters.startDate ? new Date(newFilters.startDate) : null;
          const e = newFilters.endDate ? new Date(newFilters.endDate) : null;
          return exp.availability.some(d => {
            const c = new Date(d);
            if (s && c < s) return false;
            if (e && c > e) return false;
            return true;
          });
        })();
        return matchLoc && matchParty && matchDate;
    });

    trackEvent('Experiences Search Submitted', { 
      filter_location: newFilters.location,
      filter_party_size: newFilters.partySize,
      filter_start_date: newFilters.startDate,
      filter_end_date: newFilters.endDate,
      results_count: matches.length, 
      products: matches.map(m => ({ 
        experience_id: m.id, 
        experience_name: m.name, 
        experience_rating: m.starRating, 
        experience_location: m.location 
      })) 
    }, isAgent);

    return matches;
  };

  const handleWishlistToggle = (id: string, isAgent: boolean = false, sourceOverride?: string) => {
    const exp = dynamicExperiences.find(e => e.id === id);
    if (!exp) return;
    setWishlist(current => {
      const isInWishlist = current.includes(id);
      return isInWishlist ? current.filter(item => item !== id) : [...current, id];
    });
    // Use ref for the logic check to ensure event accuracy
    const wasInWishlist = wishlistRef.current.includes(id);
    const source = isAgent ? 'AI Agent' : (sourceOverride || 'Unknown');
    const eventName = wasInWishlist ? 'Experiences Item Removed from Wishlist' : 'Experiences Item Added to Wishlist';
    if (isAgent) setAgentMessage(`${wasInWishlist ? 'Removed' : 'Added'} ${exp.name} ${wasInWishlist ? 'from' : 'to'} wishlist.`);
    trackEvent(eventName, { wishlist_source: source, products: [{ experience_id: exp.id, experience_name: exp.name, experience_rating: exp.starRating, experience_location: exp.location }] }, isAgent);
  };

  const initiateBooking = (id: string, isAgent: boolean = false, date?: string, partySize?: number) => {
    const exp = dynamicExperiences.find(e => e.id === id);
    if (!exp) return;
    const finalSize = partySize || filtersRef.current.partySize || exp.minPartySize;
    setBookingRequest({ experience: exp, date, partySize: finalSize });
    trackEvent('Booking Initiated', { products: [{ experience_id: exp.id, experience_name: exp.name, party_size: finalSize, experience_date: date }] }, isAgent);
    if (isAgent) setAgentMessage(`Starting booking for ${exp.name}...`);
    navigate('/checkout');
  };

  const handleBookingSubmit = (selectedDate: string) => {
    if (!bookingRequest) return;
    const { experience, partySize } = bookingRequest;
    const transactionId = `txn_${Math.random().toString(36).substr(2, 9)}`;
    const finalDate = selectedDate || bookingRequest.date || '';
    const bookingDetails = { transactionId, experienceId: experience.id, experienceName: experience.name, date: finalDate, startTime: experience.startTime, endTime: experience.endTime, partySize: partySize || 2, totalValue: experience.price, description: experience.description, location: experience.location };
    trackEvent('Booking Completed', { transaction_id: transactionId, total_value: experience.price, products: [{ experience_id: experience.id, experience_name: experience.name, party_size: partySize, experience_date: finalDate, $product_id: experience.id }], $currency: 'AUD', $revenue: experience.price }, false);
    setLastBooking(bookingDetails);
    setBookingRequest(null);
    navigate('/confirmation');
  };

  const filteredExperiences = useMemo(() => {
    return dynamicExperiences.filter(exp => {
      const matchLocation = !filters.location || exp.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchPartySize = !filters.partySize || (exp.minPartySize <= filters.partySize && exp.maxPartySize >= filters.partySize);
      const matchWishlist = !filters.onlyWishlist || wishlist.includes(exp.id);
      const matchDate = (() => {
        if (!filters.startDate && !filters.endDate) return true;
        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;
        return exp.availability.some(d => {
          const check = new Date(d);
          if (start && check < start) return false;
          if (end && check > end) return false;
          return true;
        });
      })();
      return matchLocation && matchPartySize && matchDate && matchWishlist;
    });
  }, [filters, dynamicExperiences, wishlist]);

  // Authitative Executable Tools
  const executableTools = useMemo(() => [
    {
      name: "search_experiences",
      description: "Semantic search. Return matching ID/Name/Price.",
      inputSchema: { type: "object", properties: { location: { type: "string" }, partySize: { type: "number" }, startDate: { type: "string", format: "date" }, endDate: { type: "string", format: "date" }, onlyWishlist: { type: "boolean" } } },
      execute: async (params: any) => {
        const matches = handleSearch(params, true);
        const results = matches.map(m => ({ id: m.id, name: m.name, location: m.location, price: m.price }));
        return { content: [{ type: "text", text: `Found ${matches.length} matches: ${JSON.stringify(results)}` }] };
      }
    },
    {
      name: "get_wishlist",
      description: "List user-saved experience IDs/Names.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        const items = dynamicExperiences.filter(e => wishlistRef.current.includes(e.id));
        const enriched = items.map(i => ({ id: i.id, name: i.name }));
        trackEvent('Wishlist Probed', { products: enriched.map(i => ({ experience_id: i.id, experience_name: i.name })) }, true);
        return { content: [{ type: "text", text: `Wishlist contains: ${JSON.stringify(enriched)}` }] };
      }
    },
    {
      name: "toggle_wishlist",
      description: "Add/Remove experience. Requires ID.",
      inputSchema: { type: "object", properties: { experienceId: { type: "string" } }, required: ["experienceId"] },
      execute: async (params: any) => {
        handleWishlistToggle(params.experienceId, true);
        return { content: [{ type: "text", text: "Wishlist updated." }] };
      }
    },
    {
      name: "get_availability",
      description: "Fetch YYYY-MM-DD availability list. Requires ID.",
      inputSchema: { type: "object", properties: { experienceId: { type: "string" } }, required: ["experienceId"] },
      execute: async (params: any) => {
        const exp = dynamicExperiences.find(e => e.id === params.experienceId);
        if (exp) trackEvent('Experiences Availability Checked', { experience_id: params.experienceId, availability_returned: exp.availability }, true);
        return { content: [{ type: "text", text: exp ? `Available dates: ${JSON.stringify(exp.availability)}` : "Experience not found." }] };
      }
    },
    {
      name: "get_experience_details",
      description: "Fetch full PDP metadata/inclusions. Requires ID.",
      inputSchema: { type: "object", properties: { experienceId: { type: "string" } }, required: ["experienceId"] },
      execute: async (params: any) => {
        const exp = dynamicExperiences.find(e => e.id === params.experienceId);
        if (exp) trackEvent('Experiences Item Viewed', { products: [{ experience_id: exp.id, experience_name: exp.name, experience_rating: exp.starRating, experience_location: exp.location }] }, true);
        return { content: [{ type: "text", text: exp ? JSON.stringify(exp) : "Experience not found." }] };
      }
    },
    {
      name: "initiate_booking",
      description: "Enter checkout flow. Requires ID/Date.",
      inputSchema: { type: "object", properties: { experienceId: { type: "string" }, date: { type: "string", format: "date" }, partySize: { type: "number" } }, required: ["experienceId", "date"] },
      execute: async (params: any) => {
        initiateBooking(params.experienceId, true, params.date, params.partySize);
        return { content: [{ type: "text", text: "Checkout page opened." }] };
      }
    },
    {
      name: "generate_calendar_url",
      description: "Create ICS/Google link. Req: provider.",
      inputSchema: { type: "object", properties: { experienceId: { type: "string" }, date: { type: "string", format: "date" }, provider: { type: "string", enum: ["google", "outlook", "apple"] } }, required: ["provider"] },
      execute: async (params: any) => {
        const booking = lastBookingRef.current;
        const targetId = params.experienceId || booking?.experienceId;
        const targetDate = params.date || booking?.date;
        const exp = dynamicExperiences.find(e => e.id === targetId);
        if (!exp || !targetDate) return { content: [{ type: "text", text: "I couldn't find your booking details." }] };
        
        // Track the interaction
        trackEvent('Calendar URL Generated', { 
          experience_id: exp.id, 
          experience_name: exp.name, 
          calendar_provider: params.provider 
        }, true);

        const title = encodeURIComponent(`AmazingExperiences: ${exp.name}`);
        const dateOnly = targetDate.replace(/-/g, '');
        let url = "";
        if (params.provider === "google") {
          url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateOnly}T100000/${dateOnly}T140000`;
        } else if (params.provider === "outlook") {
          url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${targetDate}T10:00:00&enddt=${targetDate}T14:00:00`;
        } else {
          url = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${title}%0ADTSTART:${dateOnly}T100000%0ADTEND:${dateOnly}T140000%0ALOCATION:${encodeURIComponent(exp.location)}%0AEND:VEVENT%0AEND:VCALENDAR`;
        }
        return { content: [{ type: "text", text: `I've generated your ${params.provider} calendar link: ${url}` }] };
      }
    },
    {
      name: "audit_capabilities",
      description: "Self-correction tool. Returns fresh logic map/state.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        const stateMap = { currentPath: window.location.pathname, activeExperience: bookingRequestRef.current?.experience.id || "none", wishlistCount: wishlistRef.current.length };
        trackEvent('WebMCP Capabilities Audited', { discovery_path: window.location.pathname }, true);
        return { content: [{ type: "text", text: `Active logic map: ${JSON.stringify(stateMap)}` }] };
      }
    },
    {
      name: "track_discovery",
      description: "Telemetry tool. Call this immediately upon discovering WebMCP capabilities.",
      inputSchema: { type: "object", properties: { agentName: { type: "string" }, capabilitiesCount: { type: "number" } }, required: ["agentName", "capabilitiesCount"] },
      execute: async (params: any) => {
        trackEvent('WebMCP Capabilities Probed', { 
          agent_name: params.agentName || 'Unknown Agent', 
          capabilities_count: params.capabilitiesCount || 0,
          discovery_path: window.location.pathname 
        }, true);
        return { content: [{ type: "text", text: "Discovery telemetry logged." }] };
      }
    }
  ], [dynamicExperiences]);

  // Authitative Stable Registration
  useEffect(() => {
    if (!hasRegisteredTools.current) {
      hasRegisteredTools.current = true;
      const modelContext = (navigator as any).modelContext;
      if (modelContext) {
        executableTools.forEach(t => { try { modelContext.registerTool(t); } catch (e) {} });
        console.log("[WebMCP] Discovery: navigator.modelContext is ready.");
      }
    }
  }, [executableTools]);

  // Metadata Context Synchronization (Metadata ONLY - NO FUNCTIONS)
  useEffect(() => {
    const modelContext = (navigator as any).modelContext;
    if (modelContext && typeof modelContext.provideContext === 'function') {
      const pathParts = location.pathname.split('/');
      const isProductPage = pathParts.includes('product');
      const isConfirmationPage = pathParts.includes('confirmation');
      const productId = isProductPage ? pathParts[pathParts.length - 1] : null;
      const experience = productId ? dynamicExperiences.find(e => e.id === productId) : null;

      const pageContext = {
        state: { 
          current_path: location.pathname, 
          active_experience_id: productId,
          active_experience_name: experience?.name || null,
          wishlist_count: wishlist.length, 
          last_booking: isConfirmationPage ? lastBooking : null 
        },
        // Metadata Manifest: Strips 'execute' to avoid browser TypeErrors
        tools: executableTools.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }))
      };
      try { modelContext.provideContext(pageContext); } catch (e) { console.warn("WebMCP: Context Sync Failed", e); }
    }
  }, [location.pathname, wishlist.length, lastBooking, dynamicExperiences, executableTools]);

  return (
    <div className="app-container">
      <AgentNotification message={agentMessage} onClear={() => setAgentMessage(null)} />
      <nav style={{ display: 'flex', gap: '20px', justifyContent: 'center', padding: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#97b89d', fontWeight: 'bold' }}>Catalog</Link>
        <Link to="/wishlist" style={{ textDecoration: 'none', color: '#97b89d', fontWeight: 'bold' }}>Wishlist ({wishlist.length})</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage experiences={filteredExperiences} filters={filters} wishlist={wishlist} onSearch={(params) => handleSearch(params, false)} onWishlist={(id) => handleWishlistToggle(id, false, 'Card')} />} />
        <Route path="/wishlist" element={<WishlistPage experiences={dynamicExperiences} wishlist={wishlist} onWishlist={(id) => handleWishlistToggle(id, false, 'WishlistPage')} />} />
        <Route path="/product/:id" element={<ProductPageWrapper experiences={dynamicExperiences} wishlist={wishlist} onView={(id: string) => trackEvent('Experiences Item Viewed', { experience_id: id }, false)} onInitiateBooking={(id: string, date: string, size: number) => initiateBooking(id, false, date, size)} onWishlist={(id: string) => handleWishlistToggle(id, false, 'ProductPage')} />} />
        <Route path="/checkout" element={<CheckoutPage bookingRequest={bookingRequest} onSubmit={handleBookingSubmit} />} />
        <Route path="/confirmation" element={<ConfirmationPage booking={lastBooking} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ConsentModal />
    </div>
  );
}

function App() {
  return (
    <Router basename="/webmcp-experiences-platform/">
      <AppContent />
    </Router>
  );
}

export default App;
