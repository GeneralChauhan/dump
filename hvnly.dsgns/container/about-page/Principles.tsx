import Image from "next/image";
import { principles1, principles2 } from "@/public";

export default function Principles() {
  return (
    <section className="w-full padding-y rounded-t-[20px] bg-background">
      <div>
        <h1 className="sub-heading padding-x font-medium font-NeueMontreal text-secondary mb-[50px]">
          Two principles we stand behind in
          <br className="sm:hidden xm:hidden" /> every part of our work:
        </h1>
      </div>
      <div className="w-full border-t border-[#00055]">
        <div className="w-full padding-x mt-[50px] flex justify-between gap-[30px] items-center sm:flex-col xm:flex-col">
          <div className="w-[50%] sm:w-full xm:w-full flex flex-col gap-[20px]">
            <Image
              src={principles1}
              alt="img"
              className="w-full rounded-[15px]"
            />
            <div className="flex flex-col gap-[20px]">
              <p className="paragraph font-NeueMontreal text-secondary">
                Whether a website, app, or software, <br /> it should do more
                than function— it <br /> should transform the user experience.{" "}
                <br />
                We dive deep to create digital solutions <br /> that feel
                seamless, scalable, & <br /> genuinely impactful.
              </p>
            </div>
          </div>
          <div className="w-[50%] sm:w-full xm:w-full flex flex-col gap-[20px]">
            <Image
              src={principles2}
              alt="img"
              className="w-full rounded-[15px]"
            />
            <div className="flex flex-col gap-[20px]">
              <p className="paragraph font-NeueMontreal text-secondary">
                Great tech reveals what&apos;s hidden, simplifies <br /> the
                complex, & opens new possibilities. <br /> Through thoughtful
                design & development, <br /> we ensure clarity, engagement, &
                solutions <br /> that truly make a difference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
