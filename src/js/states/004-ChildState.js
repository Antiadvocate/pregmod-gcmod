/**
 * Contains a list of properties that children have
 * TODO: This is currently not implemented anywhere. It is waiting on changes to the nursery
 * TODO: A discussion on changes to the nursery is located at: https://gitgud.io/pregmodfan/fc-pregmod/-/issues/5165
 */
App.Entity.ChildState = class ChildState extends App.Entity.SlaveState {
	/**
	 * @param {number|string} [seed=undefined]
	 */
	constructor(seed=undefined) {
		// NOTE if the property you are adding could apply to more then just children then it likely belongs in SlaveState or HumanState instead
		super(seed);
		/** Child's origin
		 * @type {string} */
		this.origin = "$He was born and raised in your arcology.";
	}
	// TODO: static function that converts InfantState to ChildState
};
