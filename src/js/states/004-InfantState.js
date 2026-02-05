/**
 * Contains a list of the properties that infants have
 */
App.Entity.InfantState = class InfantState extends App.Entity.SlaveState {
	/**
	 * @param {number|string} [seed=undefined]
	 */
	constructor(seed=undefined) {
		// NOTE if the property you are adding could apply to more then just infants then it likely belongs in SlaveState or HumanState instead
		super(seed);
		this.releaseID = App.Version.release;
		/** how many weeks until the child is ready for release */
		this.growTime = 156;
		this.targetLocation = undefined;
	}
};
