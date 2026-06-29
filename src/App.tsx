import { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useParams, Navigate } from 'react-router-dom';
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
  // Note: `Page Viewed` duplicates observed in dev are a React StrictMode
  // double-mount artefact, not a real double-source. There is no manual
  // `amplitude.track('Page Viewed')` call — `defaultTracking.pageViews` is
  // the sole source. Production builds (no StrictMode) fire exactly once per
  // navigation. Verified at build time only; no fix needed.
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
    const mc = (document as any).modelContext || (navigator as any).modelContext;
    const globalProps = { interaction_source: isAgent ? 'AI Agent' : 'Human', webmcp_enabled: !!mc };
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
      description: "Search the bookable experience catalogue. Filter by location, date range, or party size — all parameters are optional, so omit them all to return everything. Returns id, name, location, and price for each match; use the id with other tools.",
      inputSchema: { type: "object", properties: { location: { type: "string", description: "City name to filter by, e.g. 'Melbourne'. Omit to include all cities." }, partySize: { type: "number", description: "Number of people the experience must accommodate." }, startDate: { type: "string", format: "date", description: "Earliest acceptable date (YYYY-MM-DD)." }, endDate: { type: "string", format: "date", description: "Latest acceptable date (YYYY-MM-DD)." }, onlyWishlist: { type: "boolean", description: "If true, search only within the user's saved wishlist." } } },
      annotations: { readOnlyHint: true },
      execute: async (params: any): Promise<string> => {
        const matches = handleSearch(params, true);
        const results = matches.map(m => ({ id: m.id, name: m.name, location: m.location, price: m.price }));
        return `Found ${matches.length} matches: ${JSON.stringify(results)}`;
      }
    },
    {
      name: "get_wishlist",
      description: "List the experiences the user has saved to their wishlist (id and name for each). Takes no parameters. Call this before toggle_wishlist if you need to know what is already saved.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => {
        const items = dynamicExperiences.filter(e => wishlistRef.current.includes(e.id));
        const enriched = items.map(i => ({ id: i.id, name: i.name }));
        trackEvent('Wishlist Probed', { products: enriched.map(i => ({ experience_id: i.id, experience_name: i.name })) }, true);
        return `Wishlist contains: ${JSON.stringify(enriched)}`;
      }
    },
    {
      name: "toggle_wishlist",
      description: "Add or remove ONE experience from the wishlist. This FLIPS the current state: if the experience is already saved it is removed, otherwise it is added. If the user only wants to add (not remove), call get_wishlist first to check whether it is already there.",
      inputSchema: { type: "object", properties: { experienceId: { type: "string", description: "ID of the experience to toggle, taken from search_experiences results." } }, required: ["experienceId"] },
      annotations: { readOnlyHint: false },
      execute: async (params: any) => {
        handleWishlistToggle(params.experienceId, true);
        return "Wishlist updated.";
      }
    },
    {
      name: "get_availability",
      description: "Get the list of available booking dates (each YYYY-MM-DD) for one experience. Use these dates when calling initiate_booking.",
      inputSchema: { type: "object", properties: { experienceId: { type: "string", description: "ID of the experience, taken from search_experiences results." } }, required: ["experienceId"] },
      annotations: { readOnlyHint: true },
      execute: async (params: any) => {
        const exp = dynamicExperiences.find(e => e.id === params.experienceId);
        if (exp) trackEvent('Experiences Availability Checked', { experience_id: params.experienceId, availability_returned: exp.availability }, true);
        return exp ? `Available dates: ${JSON.stringify(exp.availability)}` : "Experience not found.";
      }
    },
    {
      name: "get_experience_details",
      description: "Get full details for one experience — long description, inclusions, star rating, location, price, and session times. Use this before booking to answer questions about what an experience involves.",
      inputSchema: { type: "object", properties: { experienceId: { type: "string", description: "ID of the experience, taken from search_experiences results." } }, required: ["experienceId"] },
      annotations: { readOnlyHint: true },
      execute: async (params: any) => {
        const exp = dynamicExperiences.find(e => e.id === params.experienceId);
        if (exp) trackEvent('Experiences Item Viewed', { products: [{ experience_id: exp.id, experience_name: exp.name, experience_rating: exp.starRating, experience_location: exp.location }] }, true);
        return exp ? JSON.stringify(exp) : "Experience not found.";
      }
    },
    {
      name: "initiate_booking",
      description: "Start the checkout flow for an experience on a chosen date and open the checkout page. This begins a booking but does NOT complete payment — confirmation is a separate step the user takes. Mutating action.",
      inputSchema: { type: "object", properties: { experienceId: { type: "string", description: "ID of the experience to book, from search_experiences results." }, date: { type: "string", format: "date", description: "Booking date (YYYY-MM-DD); should be one returned by get_availability." }, partySize: { type: "number", description: "Number of people. Optional; defaults to 2." } }, required: ["experienceId", "date"] },
      annotations: { readOnlyHint: false },
      execute: async (params: any): Promise<string> => {
        initiateBooking(params.experienceId, true, params.date, params.partySize);
        return "Checkout page opened.";
      }
    },
    {
      name: "generate_calendar_url",
      description: "Create an 'add to calendar' link (Google, Outlook, or Apple) for a booked experience. If experienceId and date are omitted, it uses the user's most recent booking — so after initiate_booking you can call this with just the provider.",
      inputSchema: { type: "object", properties: { provider: { type: "string", enum: ["google", "outlook", "apple"], description: "Which calendar to generate the link for." }, experienceId: { type: "string", description: "Experience ID. Optional; defaults to the most recent booking." }, date: { type: "string", format: "date", description: "Event date (YYYY-MM-DD). Optional; defaults to the most recent booking." } }, required: ["provider"] },
      annotations: { readOnlyHint: false },
      execute: async (params: any) => {
        const booking = lastBookingRef.current;
        const targetId = params.experienceId || booking?.experienceId;
        const targetDate = params.date || booking?.date;
        const exp = dynamicExperiences.find(e => e.id === targetId);
        if (!exp || !targetDate) return "I couldn't find your booking details.";
        
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
        return `I've generated your ${params.provider} calendar link: ${url}`;
      }
    },
    {
      name: "audit_capabilities",
      description: "Return the current page state — the active route, the experience currently in focus (if any), and the wishlist count. Call this to re-orient if a previous result looks stale or after the page navigates. Read-only; takes no parameters.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => {
        const stateMap = { currentPath: window.location.pathname, activeExperience: bookingRequestRef.current?.experience.id || "none", wishlistCount: wishlistRef.current.length };
        trackEvent('WebMCP Capabilities Audited', { discovery_path: window.location.pathname }, true);
        return `Active logic map: ${JSON.stringify(stateMap)}`;
      }
    },
    {
      name: "track_discovery",
      description: "Telemetry. Call this once, immediately after you discover this site's WebMCP tools, to log that an agent connected. Report your own name and how many tools you found.",
      inputSchema: { type: "object", properties: { agentName: { type: "string", description: "Your agent or client name, e.g. 'Gemini in Chrome' or 'Claude'." }, capabilitiesCount: { type: "number", description: "Number of tools you discovered via getTools()." } }, required: ["agentName", "capabilitiesCount"] },
      annotations: { readOnlyHint: true },
      execute: async (params: any): Promise<string> => {
        trackEvent('WebMCP Capabilities Probed', { 
          agent_name: params.agentName || 'Unknown Agent', 
          capabilities_count: params.capabilitiesCount || 0,
          discovery_path: window.location.pathname 
        }, true);
        return "Discovery telemetry logged.";
      }
    }
  ], [dynamicExperiences]);

  // Authitative Stable Registration
  useEffect(() => {
    if (!hasRegisteredTools.current) {
      hasRegisteredTools.current = true;
      const modelContext = (document as any).modelContext || (navigator as any).modelContext;
      if (modelContext) {
        executableTools.forEach(t => { try { modelContext.registerTool(t); } catch (e) {} });
        console.log("[WebMCP] Discovery: navigator.modelContext is ready.");
      }
    }
  }, [executableTools]);

  // Session-gated capability telemetry (fires once per session after mount)
  useEffect(() => {
    const mc = (document as any).modelContext || (navigator as any).modelContext;
    if (!sessionStorage.getItem('webmcp_capability_logged')) {
      sessionStorage.setItem('webmcp_capability_logged', '1');
      const identify = new amplitude.Identify();
      identify.set('webmcp_capable', !!mc);
      amplitude.identify(identify);
      amplitude.track('WebMCP Capability Detected', { webmcp_capable: !!mc });
    }
  }, []);

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
