App.Art.GenAI.Ill.AgePromptPart = class AgePromptPart extends App.Art.GenAI.PromptPart {
  /**
   * @override
   */
	positive() {
	  const rawAge = this.slave.visualAge;
	  const age = Math.round((rawAge === undefined || rawAge === null) ? 25 : rawAge);

    // NOTE:
    // - We intentionally avoid loaded tags like milf/dilf/loli/teen/child/toddler.
    // - We also avoid "X year old" because it's token-heavy and can cause drift.
    // - If age < 18, we clamp to adult-coded prompts to avoid underage-coded generations.
    let stage = "";
    let decade = "";
    let cue = "";

    if (age < 18) {
      stage = "adult";decade = "18";
    } else if (age < 25) {
      stage = "adult";
      decade = "early 20s";
    } else if (age < 30) {
      stage = "adult";
      decade = "late 20s";
    } else if (age < 40) {
      stage = "adult";
      decade = "30s";
    } else if (age < 50) {
      stage = "middle-aged";
      decade = "40s";
      // optional: cue = "subtle smile lines";
    } else if (age < 60) {
      stage = "middle-aged";
      decade = "50s";
      // optional: cue = "smile lines";
    } else if (age < 70) {
      stage = "older adult";
      decade = "60s";
      cue = "wrinkles";
    } else {
      stage = "elderly";
      decade = "70s";
      cue = "wrinkles";
    }

    return [stage, decade, cue].filter(Boolean);
  }
};
