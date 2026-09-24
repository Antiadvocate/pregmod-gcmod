/**
 * PODOLATRY — a slave's feet are sacred.
 *
 * Not in the original game's list. It grows out of the feet storyline (data/story/feet.ts): a woman
 * preaching on the lower concourse that a slave girl's feet are holy, citizens kneeling to kiss
 * them, and you deciding whether that becomes law. Once adopted it judges the household on the
 * `feet` axis: bare, soft, painted, adorned, small and whole is good; calloused, caned or clipped
 * is sacrilege. Caning a slave's soles or clipping her tendons costs you with the believers, and
 * worshipping her feet in front of them earns it back.
 */
import type { Doctrine } from "./doctrines";

export const PODOLATRY: Doctrine = {
  id: "podolatry",
  noun: "Podolatry",
  adj: "Podolatrous",
  creed: "A slave's feet are sacred: kept bare and soft, washed and kissed, and never struck.",
  wants: { feet: 1, quality: 0.3 },
  excludes: ["degradationist"],
  rep: 24, cash: -500,
  earned: "Can't be adopted by decree. It starts on the lower concourse, and you decide what happens to it there.",
  look: "warm stone floors polished smooth for bare feet, copper foot basins at every fountain, and no shoes allowed past the atrium",
  policies: [
    { id: "barefoot_law", name: "The barefoot law", note: "no slave in the arcology may be shod; your own go barefoot everywhere", cost: 4000 },
    { id: "pedicure_rite", name: "The weekly washing", note: "every slave's feet are soaked, oiled and painted each week; ¤60 a slave", cost: 6000 },
    { id: "foot_tithe", name: "The tithe of kisses", note: "citizens pay to kneel and kiss your slaves' feet on the concourse", cost: 8000 },
  ],
};

/** Acts that honour a slave's feet, and acts that profane them, by act id. */
export const FOOT_HONOUR = ["worship feet", "toe suck", "pedicure"];
export const FOOT_SACRILEGE = ["bastinado"];
