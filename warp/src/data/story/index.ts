/** Every arc the game knows about, registered once on import. */
import { registerArcs } from "../../engine/story";
import { ORIGIN_ARCS } from "./origins";
import { DECK_ARCS } from "./deck";

registerArcs([...ORIGIN_ARCS, ...DECK_ARCS]);

export { ORIGINS, ORIGIN_BY_ID } from "./origins";
