import { Combine } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-combiner",
  title: "Image Combiner",
  description:
    "Join several images into one, side by side or stacked, with an adjustable gap.",
  longDescription:
    "Select two or more images and merge them into a single picture, either in a row or in a column. Images that are not the same size can be scaled to a common height or width so the seam between them lines up, which is what makes a before and after pair or a set of screenshots look deliberate rather than ragged. The order is adjustable after loading, the gap between images can be set in pixels, and the gap colour is yours to pick. Everything is drawn on a canvas element in your browser, so the images are never uploaded.",
  category: "image",
  keywords: [
    "combine images",
    "merge photos side by side",
    "join images into one",
    "stack images vertically",
    "before and after image maker",
  ],
  tags: ["image", "combine", "merge", "join", "collage", "canvas"],
  icon: Combine,
  isNew: true,
  features: [
    "Join images side by side or stacked vertically",
    "Reorder or remove any image after loading it",
    "Optional scaling to a common height or width",
    "Adjustable gap in pixels with a colour picker for the background",
    "Live preview and PNG, JPEG, or WebP output",
  ],
  faqs: [
    {
      question: "What happens when the images are different sizes?",
      answer:
        "With scaling turned on, a side by side join scales every image to the smallest height in the set and a stacked join scales to the smallest width, so the edges meet cleanly. With it turned off, images keep their original size and the extra space is filled with the background colour, which is what you want when the exact pixel dimensions matter.",
    },
    {
      question: "Which output format should I choose?",
      answer:
        "PNG for screenshots, diagrams, and anything with text or sharp edges, since it is lossless. JPEG for photographs, where the file will be considerably smaller. WebP if you want a smaller file than PNG while keeping the quality, and the images are for the web rather than for an application that may not read WebP.",
    },
    {
      question: "Can I combine more than two images?",
      answer:
        "Yes. Add as many as you need, in one selection or several, then use the arrows in the list to put them in the right order. The only practical limit is your device's memory, since the combined canvas has to hold every image at full resolution at once.",
    },
    {
      question: "Are my images uploaded to a server?",
      answer:
        "No. Each file is read with the browser File API and drawn onto a canvas on your device. Nothing is transmitted, which matters when the images are screenshots that contain account details or unreleased work.",
    },
  ],
}

export default meta
