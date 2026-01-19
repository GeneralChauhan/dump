export default function Credit() {
  return (
    <section className="w-full pb-[100px] lg:pb-[80px] md:pb-[60px] sm:pb-[40px] xm:pb-[40px]">
      <div className="w-full flex flex-col">
        <h1 className="sub-heading padding-x font-medium font-NeueMontreal text-secondary pb-[50px]">
          Credit
        </h1>
        <div className="w-full border-t border-[#00055] pt-[20px]">
          <div className="w-full flex sm:flex-col xm:flex-col justify-between gap-y-[15px] padding-x">
            <div className="w-1/2 sm:w-full xm:w-full">
              <h3 className="paragraph font-medium text-secondary font-NeueMontreal">
                Services we provided:
              </h3>
            </div>
            <div className="w-1/2 sm:w-full xm:w-full flex sm:flex-col xm:flex-col justify-between gap-y-[20px]">
              <div className="flex flex-col gap-[10px]">
                <div className="flex flex-col">
                  <p className="paragraph font-NeueMontreal text-secondary underline">
                    Client:
                  </p>
                  <p className="paragraph font-NeueMontreal text-secondary">
                    Tomer Levy
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="paragraph font-NeueMontreal text-secondary underline">
                    Project Manager:
                  </p>
                  <p className="paragraph font-NeueMontreal text-secondary">
                    Abhinab Pratap Singh Chauhan
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="flex flex-col">
                  <p className="paragraph font-NeueMontreal text-secondary underline">
                    Team:
                  </p>
                  <p className="paragraph font-NeueMontreal text-secondary">
                    Abhinab, Bangalore
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="paragraph font-NeueMontreal text-secondary underline">
                    Motion & Animation:
                  </p>
                  <p className="paragraph font-NeueMontreal text-secondary">
                    Abhinab
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
