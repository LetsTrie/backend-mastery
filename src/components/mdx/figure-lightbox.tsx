"use client";

import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { GallerySlide } from "./figure-gallery";

/** Loaded on demand by <FigureGallery />. Diagrams are SVG, so deep zoom stays sharp. */
export default function FigureLightbox({
  slides,
  index,
  dark,
  onClose,
}: {
  slides: GallerySlide[];
  index: number;
  dark: boolean;
  onClose: () => void;
}) {
  return (
    <Lightbox
      open
      index={index}
      close={onClose}
      className="figure-lightbox"
      plugins={[Zoom, Fullscreen, Captions]}
      slides={slides.map((slide) => ({
        src: (dark && slide.darkSrc) || slide.src,
        width: slide.width,
        height: slide.height,
        alt: slide.alt,
        title: slides.length > 1 ? `${slide.title} of ${slides.length}` : slide.title,
        description: slide.description,
      }))}
      carousel={{ finite: true, padding: "24px" }}
      controller={{ closeOnBackdropClick: true }}
      zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true, doubleClickMaxStops: 2 }}
      captions={{ showToggle: true, descriptionTextAlign: "center", descriptionMaxLines: 3 }}
      render={slides.length > 1 ? undefined : { buttonPrev: () => null, buttonNext: () => null }}
    />
  );
}
