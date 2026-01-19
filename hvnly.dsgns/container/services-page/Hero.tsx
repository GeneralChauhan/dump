export default function Hero() {
  return (
    <section className="w-full min-h-screen">
      <div className="w-full flex flex-col justify-between">
        <div className="w-full flex flex-col">
          <div className="w-full margin padding-x">
            <div>
              <h1 className="heading tracking-[-1.3px] text-[#000] font-semibold font-FoundersGrotesk uppercase">
                services
              </h1>
            </div>
          </div>
          <div className="w-full border-t border-[#00055]">
            <p className="w-[80%] sm:w-full xm:w-full sub-heading font-normal padding-x font-NeueMontreal text-secondary padding-y">
              We build&nbsp;
              <span className="xl:link-flash lg:link-flash md:link-flash cursor-pointer">
                digital products&nbsp;
              </span>
              and&nbsp;
              <span className="xl:link-flash lg:link-flash md:link-flash cursor-pointer">
                marketing strategies&nbsp;
              </span>
              that grow your business, engage your audience, and drive results.
            </p>
          </div>
          <div className="w-full flex border-t border-[#00055] py-[20px] flex-col">
            <div className="w-full flex justify-between sm:flex-col xm:flex-col padding-x sm:gap-[20px] xm:gap-[20px]">
              <div className="w-[50%] sm:w-full xm:w-full">
                <p className="paragraph font-NeueMontreal text-secondary">
                  We approach every <br /> project with strategy:
                </p>
              </div>
              <div className="w-[50%] sm:w-full xm:w-full flex justify-between sm:flex-col xm:flex-col gap-[20px]	">
                <div className="w-[50%] sm:w-full xm:w-full flex flex-col gap-[20px]">
                  <div className="flex flex-col gap-[20px]">
                    <p className="paragraph font-NeueMontreal text-secondary underline">
                      Business goals first
                    </p>
                    <p className="paragraph font-NeueMontreal text-secondary">
                      What do you want to achieve?
                      <br className="sm:hidden xm:hidden" /> Understanding your
                      business objectives <br className="sm:hidden xm:hidden" />
                      allows us to craft solutions that
                      <br className="sm:hidden xm:hidden" /> drive real results
                      and scale your growth.
                    </p>
                  </div>
                  <div className="flex flex-col gap-[20px]">
                    <p className="paragraph font-NeueMontreal text-secondary underline">
                      User-centric design
                    </p>
                    <p className="paragraph font-NeueMontreal text-secondary">
                      Who are your users? What do they need? We
                      <br className="sm:hidden xm:hidden" /> research your
                      audience deeply to create
                      <br className="sm:hidden xm:hidden" /> experiences they
                      love—whether it's a website,
                      <br className="sm:hidden xm:hidden" /> app, or marketing
                      campaign.
                    </p>
                  </div>
                </div>
                <div className="w-[50%] sm:w-full xm:w-full">
                  <div className="flex flex-col gap-[20px]">
                    <p className="paragraph font-NeueMontreal text-secondary underline">
                      Full-stack execution
                    </p>
                    <p className="paragraph font-NeueMontreal text-secondary">
                      From code to content, we handle it all. Whether
                      <br className="sm:hidden xm:hidden" /> you need a new
                      website, marketing strategy, or
                      <br className="sm:hidden xm:hidden" /> social media
                      campaign—everything is integrated
                      <br className="sm:hidden xm:hidden" /> and optimized for
                      maximum impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
