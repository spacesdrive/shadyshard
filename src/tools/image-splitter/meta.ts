import { Grid2x2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-splitter",
  title: "Image Splitter",
  description: "Cut one image into a grid of equal tiles and save each piece separately.",
  longDescription:
    "Drop in an image, choose how many rows and columns to cut it into, and get every tile as its own file. The common social layouts are one click away, including the three by three grid used for a profile feed and the three across strip used for a carousel, and any grid up to ten by ten can be set manually. Tiles are cut with the canvas API in your browser, so the picture is never uploaded to a server, which is the practical difference from the grid makers that require a file upload before they will show you anything.",
  category: "image",
  keywords: [
    "image splitter",
    "split image into grid",
    "instagram grid maker",
    "cut image into tiles",
    "divide image into parts",
  ],
  tags: ["image", "split", "grid", "tiles", "instagram", "crop", "canvas"],
  icon: Grid2x2,
  features: [
    "One-click presets for 3 x 3, 3 x 1, 2 x 2, and 1 x 3 layouts",
    "Any custom grid up to 10 rows by 10 columns",
    "PNG, JPEG, or WebP output",
    "Preview every tile before saving, with its file size",
    "Save one tile or download the whole set",
  ],
  faqs: [
    {
      question: "In what order should I post the tiles for a social grid?",
      answer:
        "Each file is named with its row and column, for example name-r1c2 for the first row and second column. Feeds that fill right to left and top to bottom need the tiles posted in reverse order, so start with the bottom right tile and finish with the top left one, and the grid assembles correctly.",
    },
    {
      question: "What happens if the image does not divide evenly?",
      answer:
        "Tile dimensions are rounded down to a whole number of pixels, so a few pixels at the right and bottom edges are left out rather than producing tiles of different sizes. Crop the image to a multiple of your grid first if those edge pixels matter.",
    },
    {
      question: "Why does downloading all the tiles produce separate files?",
      answer:
        "Because building a zip archive would mean adding a compression library for something the browser can already do one file at a time. Downloading the set triggers each tile as its own download, and your browser may ask once for permission to save multiple files.",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. The file is read with the browser File API and cut on a canvas element on your device. Nothing is sent over the network, nothing is stored, and closing the page discards everything.",
    },
  ],
}

export default meta
