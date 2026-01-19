"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useReveal } from "@/hooks/use-reveal";
import { MagneticButton } from "@/components/magnetic-button";
import { Clock, Calendar, Ticket, User } from "lucide-react";
import { Shader, ChromaFlow, Swirl } from "shaders/react";
import { CustomCursor } from "@/components/custom-cursor";
import { GrainOverlay } from "@/components/grain-overlay";

type BookingStep = "date" | "time" | "sku" | "checkout";

interface EventDate {
  id: string;
  date: string;
  available: boolean;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  capacity: number;
}

interface SKU {
  id: string;
  name: string;
  base_price: number;
  category: string;
}

interface OrderItem {
  sku_id: string;
  quantity: number;
  sku_name: string;
  price: number;
}

export function BookingSection({ onComplete }: { onComplete?: () => void }) {
  const supabase = createClient();
  const { ref, isVisible } = useReveal(0.3);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shaderContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const scrollThrottleRef = useRef<number | undefined>(undefined);

  const [currentStep, setCurrentStep] = useState<BookingStep>("date");
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [eventId, setEventId] = useState<string>("");
  const [eventDates, setEventDates] = useState<EventDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas");
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true);
          return true;
        }
      }
      return false;
    };

    if (checkShaderReady()) return;

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId);
      }
    }, 100);

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);

    return () => {
      clearInterval(intervalId);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      });
      setCurrentSection(index);
    }
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchStartY.current - touchEndY;
      const deltaX = touchStartX.current - touchEndX;

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < 3) {
          scrollToSection(currentSection + 1);
        } else if (deltaY < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      container.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [currentSection]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();

        if (!scrollContainerRef.current) return;

        scrollContainerRef.current.scrollBy({
          left: e.deltaY,
          behavior: "instant",
        });

        const sectionWidth = scrollContainerRef.current.offsetWidth;
        const newSection = Math.round(
          scrollContainerRef.current.scrollLeft / sectionWidth
        );
        if (newSection !== currentSection) {
          setCurrentSection(newSection);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [currentSection]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return;

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined;
          return;
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth;
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const newSection = Math.round(scrollLeft / sectionWidth);

        if (
          newSection !== currentSection &&
          newSection >= 0 &&
          newSection <= 3
        ) {
          setCurrentSection(newSection);
        }

        scrollThrottleRef.current = undefined;
      });
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current);
      }
    };
  }, [currentSection]);

  // First, fetch the event to get its UUID
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id")
          .eq("title", "Van Gogh – An Immersive Story")
          .maybeSingle();

        if (error) {
          // If not found by title, just get the first event
          const { data: firstEvent } = await supabase
            .from("events")
            .select("id")
            .limit(1)
            .single();

          if (firstEvent) {
            setEventId(firstEvent.id);
          }
        } else if (data) {
          setEventId(data.id);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };

    fetchEvent();
  }, [supabase]);

  useEffect(() => {
    if (!eventId) return;

    const fetchDates = async () => {
      try {
        const { data, error } = await supabase
          .from("event_dates")
          .select("*")
          .eq("event_id", eventId)
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(30);

        if (error) {
          console.log("[v0] Error fetching dates:", error.message);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const mappedDates = data.map((d) => ({
            id: d.id,
            date: d.date,
            available: d.is_available,
          }));
          setEventDates(mappedDates);
          console.log("[v0] Fetched dates:", mappedDates);
        } else {
          console.log("[v0] No dates found from Supabase");
        }

        setLoading(false);
      } catch (err) {
        console.log("[v0] Exception fetching dates:", err);
        setLoading(false);
      }
    };

    fetchDates();
  }, [supabase, eventId]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate) return;

      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("event_date_id", selectedDate)
        .order("start_time", { ascending: true });

      if (!error && data) {
        setTimeSlots(data);
        setSelectedTimeSlot("");
      }
    };

    fetchTimeSlots();
  }, [selectedDate, supabase]);

  useEffect(() => {
    const fetchSKUs = async () => {
      if (!selectedTimeSlot || !eventId) return;

      const { data, error } = await supabase
        .from("skus")
        .select("*")
        .eq("event_id", eventId)
        .eq("is_active", true)
        .order("base_price", { ascending: true });

      if (!error && data) {
        setSKUs(data);
        setOrderItems([]);
      }
    };

    fetchSKUs();
  }, [selectedTimeSlot, supabase, eventId]);

  const handleAddToOrder = (sku: SKU, quantity: number) => {
    if (quantity <= 0) return;

    const existingItem = orderItems.find((item) => item.sku_id === sku.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.sku_id === sku.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          sku_id: sku.id,
          quantity,
          sku_name: sku.name,
          price: sku.base_price,
        },
      ]);
    }
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (
      !visitorName ||
      !visitorEmail ||
      orderItems.length === 0 ||
      !selectedTimeSlot
    ) {
      return;
    }

    // Create a booking for each order item (or combine into one booking with total quantity)
    // For simplicity, we'll create one booking per SKU
    const bookings = orderItems.map((item) => ({
      time_slot_id: selectedTimeSlot,
      sku_id: item.sku_id,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      visitor_name: visitorName,
      visitor_email: visitorEmail,
      status: "pending" as const,
    }));

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert(bookings)
      .select();

    if (error) {
      console.error("Booking error:", error);
      alert("Failed to create booking. Please try again.");
      return;
    }

    // Update inventory for each booking
    for (const item of orderItems) {
      // Get current inventory
      const { data: currentInv } = await supabase
        .from("inventory")
        .select("available_quantity")
        .eq("time_slot_id", selectedTimeSlot)
        .eq("sku_id", item.sku_id)
        .single();

      if (currentInv) {
        const newQuantity = Math.max(
          0,
          currentInv.available_quantity - item.quantity
        );
        const { error: invError } = await supabase
          .from("inventory")
          .update({ available_quantity: newQuantity })
          .eq("time_slot_id", selectedTimeSlot)
          .eq("sku_id", item.sku_id);

        if (invError) {
          console.error("Error updating inventory:", invError);
        }
      }
    }

    const bookingId = booking?.[0]?.id;
    if (bookingId) {
      window.location.href = `/payment?booking_id=${bookingId}`;
    } else {
      window.location.href = `/payment`;
    }
  };

  return (
    <section
      ref={ref}
      className="relative h-screen w-screen shrink-0 snap-start overflow-hidden bg-background"
    >
      <CustomCursor />
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#1275d8"
            colorB="#e19136"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#0066ff"
            upColor="#0066ff"
            downColor="#d1d1d1"
            leftColor="#e19136"
            rightColor="#e19136"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-opacity duration-700 md:px-12 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => onComplete?.()}
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/15 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-foreground/25">
            <span className="font-sans text-xl font-bold text-foreground">
              ←
            </span>
          </div>
          <span className="font-sans text-xl font-semibold tracking-tight text-foreground">
            Back
          </span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {["Date", "Time", "Tickets", "Checkout"].map((item, index) => (
            <button
              key={item}
              onClick={() => {
                scrollToSection(index);
                const steps: BookingStep[] = [
                  "date",
                  "time",
                  "sku",
                  "checkout",
                ];
                setCurrentStep(steps[index]);
              }}
              className={`group relative font-sans text-sm font-medium transition-colors ${
                currentSection === index
                  ? "text-foreground"
                  : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {item}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                  currentSection === index ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>
      </nav>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        className={`relative z-10 flex h-screen overflow-x-auto overflow-y-hidden transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Date Selection Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="w-full max-w-4xl">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Step 1 of 4
              </p>
            </div>
            <h2 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-foreground duration-1000">
              <span className="text-balance">Select a Date</span>
            </h2>
            <p className="mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-xl">
              <span className="text-pretty">
                Choose your preferred date to experience the immersive Van Gogh
                exhibition.
              </span>
            </p>

            {loading ? (
              <div className="text-center py-20 animate-in fade-in duration-1000">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
              </div>
            ) : eventDates.length === 0 ? (
              <div className="text-center py-20 animate-in fade-in duration-1000">
                <p className="text-foreground/60 text-lg">
                  No dates available at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                {eventDates.map((date) => {
                  const dateObj = new Date(date.date);
                  const formatted = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <button
                      key={date.id}
                      onClick={() => {
                        if (date.available) {
                          setSelectedDate(date.id);
                          setCurrentStep("time");
                          scrollToSection(1);
                        }
                      }}
                      disabled={!date.available}
                      className={`p-6 rounded-lg transition-all backdrop-blur-md border ${
                        selectedDate === date.id
                          ? "bg-foreground text-background border-foreground"
                          : date.available
                          ? "bg-foreground/10 hover:bg-foreground/20 text-foreground border-foreground/20"
                          : "bg-foreground/5 text-foreground/40 cursor-not-allowed border-foreground/10"
                      }`}
                    >
                      <div className="text-lg font-semibold">{formatted}</div>
                      <div className="text-xs text-foreground/60 mt-1">
                        {dateObj.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Time Selection Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="w-full max-w-4xl">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Step 2 of 4
              </p>
            </div>
            <h2 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-foreground duration-1000">
              <span className="text-balance">Select a Time</span>
            </h2>
            <p className="mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-xl">
              <span className="text-pretty">
                Choose your preferred time slot for the immersive experience.
              </span>
            </p>

            {loading ? (
              <div className="text-center py-20 animate-in fade-in duration-1000">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-20 animate-in fade-in duration-1000">
                <p className="text-foreground/60 text-lg">
                  No time slots available for this date.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelectedTimeSlot(slot.id);
                      setCurrentStep("sku");
                      scrollToSection(2);
                    }}
                    className={`w-full p-6 rounded-lg transition-all flex items-center gap-4 backdrop-blur-md border ${
                      selectedTimeSlot === slot.id
                        ? "bg-foreground text-background border-foreground"
                        : "bg-foreground/10 hover:bg-foreground/20 text-foreground border-foreground/20"
                    }`}
                  >
                    <Clock size={24} />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-lg">
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <div className="text-sm text-foreground/60">
                        {slot.capacity} seats available
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <MagneticButton
              onClick={() => {
                setCurrentStep("date");
                scrollToSection(0);
              }}
              variant="secondary"
              className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400"
            >
              Back
            </MagneticButton>
          </div>
        </section>

        {/* Ticket Selection Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="w-full max-w-4xl">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90 flex items-center gap-2">
                <Ticket className="h-3 w-3" />
                Step 3 of 4
              </p>
            </div>
            <h2 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-foreground duration-1000">
              <span className="text-balance">Select Tickets</span>
            </h2>
            <p className="mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-xl">
              <span className="text-pretty">
                Choose your ticket type and quantity for the immersive Van Gogh
                experience.
              </span>
            </p>

            {loading ? (
              <div className="text-center py-20 animate-in fade-in duration-1000">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
              </div>
            ) : skus.length === 0 ? (
              <div className="text-center py-20 animate-in fade-in duration-1000">
                <p className="text-foreground/60 text-lg">
                  No ticket types available.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                {skus.map((sku) => {
                  const item = orderItems.find((o) => o.sku_id === sku.id);
                  const quantity = item ? item.quantity : 0;

                  return (
                    <div
                      key={sku.id}
                      className="p-6 rounded-lg bg-foreground/10 hover:bg-foreground/20 transition-all backdrop-blur-md border border-foreground/20"
                    >
                      <h3 className="text-xl font-semibold mb-2 text-foreground">
                        {sku.name}
                      </h3>
                      <p className="text-sm text-foreground/60 mb-4">
                        {sku.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-foreground">
                          ₹{sku.base_price.toFixed(0)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (quantity > 0) {
                                setOrderItems(
                                  orderItems
                                    .map((o) =>
                                      o.sku_id === sku.id
                                        ? { ...o, quantity: o.quantity - 1 }
                                        : o
                                    )
                                    .filter((o) => o.quantity > 0)
                                );
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-foreground/20 hover:bg-foreground/30 text-foreground transition-all"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold text-foreground">
                            {quantity}
                          </span>
                          <button
                            onClick={() => {
                              const existing = orderItems.find(
                                (o) => o.sku_id === sku.id
                              );
                              if (existing) {
                                setOrderItems(
                                  orderItems.map((o) =>
                                    o.sku_id === sku.id
                                      ? { ...o, quantity: o.quantity + 1 }
                                      : o
                                  )
                                );
                              } else {
                                setOrderItems([
                                  ...orderItems,
                                  {
                                    sku_id: sku.id,
                                    quantity: 1,
                                    sku_name: sku.name,
                                    price: sku.base_price,
                                  },
                                ]);
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-foreground/20 hover:bg-foreground/30 text-foreground transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order Summary */}
            {orderItems.length > 0 && (
              <div className="p-6 rounded-lg bg-foreground/10 mb-8 backdrop-blur-md border border-foreground/20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Order Summary
                </h3>
                {orderItems.map((item) => (
                  <div
                    key={item.sku_id}
                    className="flex justify-between text-sm mb-2 text-foreground/80"
                  >
                    <span>
                      {item.sku_name} × {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t border-foreground/20 mt-4 pt-4">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Total</span>
                    <span>
                      ₹
                      {orderItems
                        .reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        )
                        .toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <MagneticButton
                onClick={() => {
                  setCurrentStep("time");
                  scrollToSection(1);
                }}
                variant="secondary"
              >
                Back
              </MagneticButton>
              {orderItems.length > 0 ? (
                <MagneticButton
                  onClick={() => {
                    setCurrentStep("checkout");
                    scrollToSection(3);
                  }}
                  variant="primary"
                >
                  Continue to Checkout
                </MagneticButton>
              ) : (
                <button className="px-6 py-2.5 text-sm rounded-full font-medium bg-foreground/20 text-foreground/50 cursor-not-allowed opacity-50">
                  Continue to Checkout
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Checkout Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="w-full max-w-4xl">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90 flex items-center gap-2">
                <User className="h-3 w-3" />
                Step 4 of 4
              </p>
            </div>
            <h2 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-foreground duration-1000">
              <span className="text-balance">Visitor Details</span>
            </h2>
            <p className="mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-xl">
              <span className="text-pretty">
                Complete your booking by providing your contact information.
              </span>
            </p>

            <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <input
                type="text"
                placeholder="Full Name"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-foreground/10 placeholder-foreground/50 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground border border-foreground/20 backdrop-blur-md"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-foreground/10 placeholder-foreground/50 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground border border-foreground/20 backdrop-blur-md"
              />
            </div>

            <div className="p-6 rounded-lg bg-foreground/10 mb-8 backdrop-blur-md border border-foreground/20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Order Summary
              </h3>
              {orderItems.map((item) => (
                <div
                  key={item.sku_id}
                  className="flex justify-between text-sm mb-2 text-foreground/80"
                >
                  <span>
                    {item.sku_name} × {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t border-foreground/20 mt-4 pt-4">
                <div className="flex justify-between font-bold text-lg text-foreground">
                  <span>Total Amount</span>
                  <span>
                    ₹
                    {orderItems
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <MagneticButton
                onClick={() => {
                  setCurrentStep("sku");
                  scrollToSection(2);
                }}
                variant="secondary"
              >
                Back
              </MagneticButton>
              {visitorName && visitorEmail && orderItems.length > 0 ? (
                <MagneticButton
                  onClick={() => {
                    handleCheckout();
                  }}
                  variant="primary"
                >
                  Proceed to Payment
                </MagneticButton>
              ) : (
                <button className="px-6 py-2.5 text-sm rounded-full font-medium bg-foreground/20 text-foreground/50 cursor-not-allowed opacity-50">
                  Proceed to Payment
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
