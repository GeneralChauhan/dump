"use client";
import Link from "next/link";
import Image from "next/image";
import { freelevanceside } from "@/public";
import { Eyes } from "@/components";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="w-full min-h-screen">
      <div className="w-full flex flex-col justify-between">
        <div className="w-full flex flex-col">
          <div className="w-full margin padding-x">
            <div>
              <h1 className="heading tracking-[-1.3px] text-[#000] font-semibold font-FoundersGrotesk uppercase mt-[30px]">
                WE ARE <br />
                <div className="flex items-center gap-[5px]">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "auto" }}
                    transition={{
                      ease: [0.86, 0, 0.07, 0.995],
                      duration: 1,
                      delay: 1.5,
                    }}
                  >
                    <Image
                      width={120}
                      height={50}
                      src={freelevanceside}
                      alt="img"
                      className="w-auto h-[95px] lg:w-auto lg:h-auto md:w-[100px] md:h-[63px] sm:w-[74px] sm:h-[45px] xm:w-[64px] xm:h-[40px] object-cover xl:mt-[15px] mt-[10px] rounded-[10px]"
                    />
                  </motion.span>
                  <h1 className="heading tracking-[-1.3px] text-[#000] font-semibold font-FoundersGrotesk uppercase">
                    hvnly
                  </h1>
                </div>
              </h1>
            </div>
          </div>
          <div className="w-full border-t border-[#00055] pt-[20px]">
            <div className="w-full flex justify-between  padding-x sm:flex-col xm:flex-col gap-[20px]">
              <div className="w-[10%] sm:w-full xm:w-full">
                <h3 className="paragraph font-medium text-secondary font-NeueMontreal">
                  About us:
                </h3>
              </div>
              <div className="w-[48%] flex justify-between sm:w-full xm:w-full sm:flex-col xm:flex-col gap-[20px]">
                <div className="w-[50%] flex flex-col gap-y-[40px] sm:w-full xm:w-full">
                  <div className="flex flex-col gap-y-[20px]">
                    <p className="paragraph font-NeueMontreal text-secondary">
                      At hvnly, we're a full-service <br /> digital studio that
                      does it all. <br /> From building websites & apps to
                      designing brands, <br /> crafting marketing strategies,
                      and launching campaigns—we handle <br /> every part of
                      your digital presence.
                    </p>
                  </div>
                  <div className="flex flex-col gap-y-[20px]">
                    <p className="paragraph font-NeueMontreal text-secondary">
                      Our mission is to help businesses thrive online through
                      integrated solutions that <br /> not only look exceptional
                      but drive real results. <br /> We founded hvnly.space to
                      be the one team you need <br /> for everything
                      digital—from code to content to campaigns.
                    </p>
                  </div>
                </div>
                <div className="flex w-fit h-fit gap-[5px] group">
                  <div className="rounded-[50px] border border-[#00099] group-hover:bg-secondary  py-[3px] px-[12px] cursor-pointer">
                    <Link
                      href="/case"
                      className="paragraph font-NeueMontreal text-secondary uppercase group-hover:text-background transition-all duration-200 ease-in"
                    >
                      Our Work
                    </Link>
                  </div>
                  <div className="w-[35px] flex items-center justify-center h-[35px] border border-[#00099] rounded-[50px] p-[12px]  group-hover:bg-secondary transition-all duration-200 ease-in cursor-pointer sm:hidden xm:hidden">
                    <p className="paragraph font-normal text-secondary group-hover:text-background">
                      <ArrowUpRight strokeWidth={1.25} />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="padding-y" data-scroll data-scroll-speed="-.1">
        <Eyes className="w-[300px] h-[300px] md:w-[200px] md:h-[200px] sm:w-[150px] sm:h-[150px] xm:w-[150px] xm:h-[150px] sm:flex-col xm:flex-col" />
      </div>
      <div className="padding-x">
        <h1 className="sub-heading font-medium font-NeueMontreal text-secondary">
          We build everything your business needs <br /> to succeed in the
          digital world.
          <br className="sm:hidden xm:hidden" />
        </h1>
      </div>
    </section>
  );
}
