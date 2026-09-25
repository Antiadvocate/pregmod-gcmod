/** Every arc the game knows about, registered once on import. */
import { registerArcs } from "../../engine/story";
import { ORIGIN_ARCS } from "./origins";
import { DECK_ARCS } from "./deck";
import { DECK2_ARCS } from "./deck2";
import { WORLD_ARCS } from "./world";
import { FEET_ARCS } from "./feet";
import { PLOT_ARCS } from "./plot";
import { DEED_ARCS } from "./deeds";

registerArcs([...ORIGIN_ARCS, ...DECK_ARCS, ...DECK2_ARCS, ...WORLD_ARCS, ...FEET_ARCS, ...PLOT_ARCS, ...DEED_ARCS]);

export { ORIGINS, ORIGIN_BY_ID } from "./origins";
