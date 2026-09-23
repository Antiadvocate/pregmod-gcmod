/** Every arc the game knows about, registered once on import. */
import { registerArcs } from "../../engine/story";
import { ORIGIN_ARCS } from "./origins";
import { DECK_ARCS } from "./deck";
import { DECK2_ARCS } from "./deck2";

registerArcs([...ORIGIN_ARCS, ...DECK_ARCS, ...DECK2_ARCS]);

export { ORIGINS, ORIGIN_BY_ID } from "./origins";
