import Lenis from "lenis";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export default class Scroll {
  lenis: Lenis;
  scroll: number;
  paralaxElements: HTMLElement[];
  startedScrolling: boolean;
  isTouchDevice: boolean;

  constructor() {
    this.lenis = new Lenis();

    this.lenis.scrollTo(0, {
      immediate: true,
    });

    this.scroll = this.lenis.scroll;

    this.lenis.on("scroll", (e) => {
      this.scroll = e.scroll;
      this.startedScrolling = true;
      console.log("ab hua scroll?");
    });
    console.log("scroll mt krr bc");

    requestAnimationFrame(this.raf.bind(this));
  }

  onScroll(callback: () => void) {
    console.log("who scrolled?");
    this.lenis.on("scroll", callback.bind(this));
  }

  resetScroll() {
    this.lenis.scrollTo(0, { immediate: true });
    this.scroll = 0;
    ScrollTrigger.refresh();
  }

  getScroll() {
    console.log("Get scroll");
    return this.scroll;
  }

  raf(time: number) {
    this.lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(this.raf.bind(this));
  }
}
