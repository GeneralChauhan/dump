"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Ticket } from "lucide-react";
import { HeroSection } from "@/components/sections/hero-section";
import { ZonesSection } from "@/components/sections/zones-section";
import { BookingSection } from "@/components/sections/booking-section";
import { NavBar } from "@/components/nav-bar";
import { Shader, ChromaFlow, Swirl } from "shaders/react";
import { CustomCursor } from "@/components/custom-cursor";
import { GrainOverlay } from "@/components/grain-overlay";
import { MagneticButton } from "@/components/magnetic-button";

interface EventData {
  id: string;
  name: string;
  description: string;
  venue: string;
}

interface EventDate {
  id: string;
  date: string;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

interface SKU {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
}

interface Inventory {
  id: string;
  available_quantity: number;
}

type Step = "landing" | "date" | "time" | "sku" | "checkout";

export default function VanGoghTicketing() {
  const supabase = createClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shaderContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const scrollThrottleRef = useRef<number | undefined>(undefined);

  const [step, setStep] = useState<Step>("landing");
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [dates, setDates] = useState<EventDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [inventory, setInventory] = useState<Map<string, Inventory>>(new Map());
  const [selectedSKU, setSelectedSKU] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");

  const handleBooking = async () => {
    if (!visitorName || !visitorEmail || !selectedSKU || !selectedSlot) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const sku = skus.find((s) => s.id === selectedSKU);
      if (!sku) return;

      const totalPrice = sku.base_price * quantity;

      sessionStorage.setItem(
        "pendingBooking",
        JSON.stringify({
          visitorName,
          visitorEmail,
          visitorPhone,
          totalPrice: totalPrice.toFixed(2),
          quantity,
          skuName: sku.name,
          selectedSlot,
          selectedSKU,
        })
      );

      // Redirect to dummy Razorpay payment page
      window.location.href = "/payment";
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing checkout. Please try again.");
    }
  };

  const getSelectedSKUInfo = () => {
    const sku = skus.find((s) => s.id === selectedSKU);
    return sku ? sku.base_price * quantity : 0;
  };

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
      const sectionHeight = scrollContainerRef.current.offsetHeight;
      scrollContainerRef.current.scrollTo({
        top: sectionHeight * index,
        behavior: "smooth",
      });
      setCurrentSection(index);
    }
  };

  useEffect(() => {
    if (step !== "landing") return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchStartY.current - touchEndY;
      const deltaX = touchStartX.current - touchEndX;

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < 2) {
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
      container.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [currentSection, step]);

  useEffect(() => {
    if (step !== "landing") return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();

        if (!scrollContainerRef.current) return;

        scrollContainerRef.current.scrollBy({
          top: e.deltaY,
          behavior: "instant",
        });

        const sectionHeight = scrollContainerRef.current.offsetHeight;
        const newSection = Math.round(
          scrollContainerRef.current.scrollTop / sectionHeight
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
  }, [currentSection, step]);

  useEffect(() => {
    if (step !== "landing") return;

    const handleScroll = () => {
      if (scrollThrottleRef.current) return;

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined;
          return;
        }

        const sectionHeight = scrollContainerRef.current.offsetHeight;
        const scrollTop = scrollContainerRef.current.scrollTop;
        const newSection = Math.round(scrollTop / sectionHeight);

        if (
          newSection !== currentSection &&
          newSection >= 0 &&
          newSection <= 2
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
  }, [currentSection, step]);

  // Fetch event and initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: eventData } = await supabase
          .from("events")
          .select("*")
          .eq("name", "Van Gogh – An Immersive Story")
          .single();

        if (eventData) {
          setEvent(eventData);

          const { data: datesData } = await supabase
            .from("event_dates")
            .select("*")
            .eq("event_id", eventData.id)
            .eq("is_available", true)
            .order("date", { ascending: true });

          if (datesData) {
            setDates(datesData);
          }

          const { data: skuData } = await supabase
            .from("skus")
            .select("*")
            .eq("event_id", eventData.id)
            .eq("is_active", true);

          if (skuData) {
            setSKUs(skuData);
          }
        }
      } catch (error) {
        console.error("Error loading event data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  // Load time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const loadTimeSlots = async () => {
        try {
          const { data } = await supabase
            .from("time_slots")
            .select("*")
            .eq("event_date_id", selectedDate)
            .order("start_time", { ascending: true });

          if (data) {
            setTimeSlots(data);
            setSelectedSlot(null);
          }
        } catch (error) {
          console.error("Error loading time slots:", error);
        }
      };

      loadTimeSlots();
    }
  }, [selectedDate, supabase]);

  // Load inventory when time slot is selected
  useEffect(() => {
    if (selectedSlot) {
      const loadInventory = async () => {
        try {
          const { data } = await supabase
            .from("inventory")
            .select("*")
            .eq("time_slot_id", selectedSlot);

          if (data) {
            const inventoryMap = new Map(data.map((inv) => [inv.sku_id, inv]));
            setInventory(inventoryMap);
            setSelectedSKU(null);
          }
        } catch (error) {
          console.error("Error loading inventory:", error);
        }
      };

      loadInventory();
    }
  }, [selectedSlot, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-foreground/80">Loading exhibition...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
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

      <NavBar />

      {step === "landing" && (
        <div
          ref={scrollContainerRef}
          data-scroll-container
          className={`relative z-10 flex flex-col h-screen overflow-y-auto overflow-x-hidden transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "y mandatory",
          }}
        >
          <div className="flex-shrink-0 scroll-snap-align-start">
            <HeroSection onStartBooking={() => setStep("date")} />
          </div>
          <div className="flex-shrink-0 scroll-snap-align-start">
            <ZonesSection />
          </div>
          <div className="flex-shrink-0 scroll-snap-align-start">
            <BookingSection onComplete={() => setStep("landing")} />
          </div>
        </div>
      )}

      {/* Date Selection Section */}
      {step === "date" && (
        <section className="min-h-screen w-full flex items-center px-4 md:px-8 lg:px-16 py-12">
          <div className="mx-auto w-full max-w-2xl">
            <Button
              variant="ghost"
              onClick={() => setStep("landing")}
              className="mb-8"
            >
              ← Back to Exhibition
            </Button>

            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-2">
                Select a Date
              </h2>
              <p className="text-foreground/60">
                Choose your preferred visit date
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dates.map((date) => {
                const d = new Date(date.date);
                const dayName = d.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const dateStr = d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <button
                    key={date.id}
                    onClick={() => {
                      setSelectedDate(date.id);
                      setStep("time");
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDate === date.id
                        ? "border-accent bg-accent/10"
                        : "border-border/50 bg-card/30 hover:border-accent/50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-accent">
                      {dayName}
                    </p>
                    <p className="text-lg font-light text-foreground">
                      {dateStr}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Time Slot Selection Section */}
      {step === "time" && (
        <section className="min-h-screen w-full flex items-center px-4 md:px-8 lg:px-16 py-12">
          <div className="mx-auto w-full max-w-2xl">
            <Button
              variant="ghost"
              onClick={() => setStep("date")}
              className="mb-8"
            >
              ← Back to Dates
            </Button>

            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-2">
                Select a Time Slot
              </h2>
              <p className="text-foreground/60">
                Choose your preferred experience time
              </p>
            </div>

            <div className="space-y-4">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => {
                    setSelectedSlot(slot.id);
                    setStep("sku");
                  }}
                  className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                    selectedSlot === slot.id
                      ? "border-accent bg-accent/10"
                      : "border-border/50 bg-card/30 hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {slot.start_time} – {slot.end_time}
                        </p>
                        <p className="text-sm text-foreground/60">
                          2-hour experience
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-foreground/60">
                      SELECT
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SKU and Quantity Selection Section */}
      {step === "sku" && (
        <section className="min-h-screen w-full flex items-center px-4 md:px-8 lg:px-16 py-12">
          <div className="mx-auto w-full max-w-4xl">
            <Button
              variant="ghost"
              onClick={() => setStep("time")}
              className="mb-8"
            >
              ← Back to Time Slots
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ticket Selection */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-light text-foreground mb-2">
                    Select Tickets
                  </h2>
                  <p className="text-foreground/60">
                    Choose your ticket type and quantity
                  </p>
                </div>

                <div className="space-y-4">
                  {skus.map((sku) => {
                    const inv = inventory.get(sku.id);
                    const available = inv?.available_quantity || 0;
                    const isAvailable = available > 0;

                    return (
                      <button
                        key={sku.id}
                        onClick={() => isAvailable && setSelectedSKU(sku.id)}
                        disabled={!isAvailable}
                        className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                          !isAvailable
                            ? "opacity-50 cursor-not-allowed border-border/30 bg-card/20"
                            : selectedSKU === sku.id
                            ? "border-accent bg-accent/10"
                            : "border-border/50 bg-card/30 hover:border-accent/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Ticket className="h-5 w-5 text-accent" />
                              <h3 className="text-lg font-semibold text-foreground">
                                {sku.name}
                              </h3>
                            </div>
                            <p className="text-sm text-foreground/60 mb-3">
                              {sku.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <p className="text-2xl font-light text-accent">
                                ₹{sku.base_price.toFixed(2)}
                              </p>
                              {!isAvailable && (
                                <p className="text-sm text-destructive font-medium">
                                  Sold Out
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="border-border/50 bg-card/50 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedSKU ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground/60">
                              Ticket Type
                            </span>
                            <span className="font-medium text-foreground">
                              {skus.find((s) => s.id === selectedSKU)?.name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-sm text-foreground/60">
                              Quantity
                            </label>
                            <div className="flex items-center gap-2 bg-card rounded-lg border border-border/50">
                              <button
                                onClick={() =>
                                  setQuantity(Math.max(1, quantity - 1))
                                }
                                className="px-3 py-1 text-foreground hover:text-accent"
                              >
                                −
                              </button>
                              <span className="px-2 font-medium text-foreground">
                                {quantity}
                              </span>
                              <button
                                onClick={() => {
                                  const inv = inventory.get(selectedSKU);
                                  if (
                                    inv &&
                                    quantity < inv.available_quantity
                                  ) {
                                    setQuantity(quantity + 1);
                                  }
                                }}
                                className="px-3 py-1 text-foreground hover:text-accent"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="border-t border-border/30 pt-3">
                            <div className="flex justify-between mb-4">
                              <span className="text-foreground/60">
                                Subtotal
                              </span>
                              <span className="font-medium text-foreground">
                                ₹{getSelectedSKUInfo().toFixed(2)}
                              </span>
                            </div>
                            <div className="text-2xl font-light text-accent mb-4">
                              ₹{getSelectedSKUInfo().toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setStep("checkout")}
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                        >
                          Proceed to Checkout
                        </Button>
                      </>
                    ) : (
                      <p className="text-center text-foreground/60 py-4">
                        Select a ticket to continue
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Checkout Section */}
      {step === "checkout" && (
        <section className="min-h-screen w-full flex items-center px-4 md:px-8 lg:px-16 py-12">
          <div className="mx-auto w-full max-w-2xl">
            <Button
              variant="ghost"
              onClick={() => setStep("sku")}
              className="mb-8"
            >
              ← Back to Tickets
            </Button>

            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-2">
                Checkout
              </h2>
              <p className="text-foreground/60">
                Complete your booking details
              </p>
            </div>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <Label className="text-foreground mb-2">Full Name</Label>
                  <Input
                    placeholder="Your full name"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="bg-card border-border/50"
                  />
                </div>

                <div>
                  <Label className="text-foreground mb-2">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    className="bg-card border-border/50"
                  />
                </div>

                <div>
                  <Label className="text-foreground mb-2">Phone Number</Label>
                  <Input
                    placeholder="+91 XXXXX XXXXX"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="bg-card border-border/50"
                  />
                </div>

                {/* Order Summary */}
                <div className="border-t border-border/30 pt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Ticket</span>
                    <span className="font-medium text-foreground">
                      {skus.find((s) => s.id === selectedSKU)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Quantity</span>
                    <span className="font-medium text-foreground">
                      {quantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Price per Ticket</span>
                    <span className="font-medium text-foreground">
                      ₹
                      {skus
                        .find((s) => s.id === selectedSKU)
                        ?.base_price.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-border/30 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground">Total Amount</span>
                      <span className="text-2xl font-light text-accent">
                        ₹{getSelectedSKUInfo().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-lg"
                >
                  Proceed to Payment
                </Button>

                <p className="text-xs text-foreground/50 text-center">
                  By booking, you agree to our terms and conditions. A
                  confirmation email will be sent to you.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
        [data-scroll-container] {
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
        }
        [data-scroll-container] > div {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
      `}</style>
    </main>
  );
}
