# Hero Slaves

Hero Slaves are used for:

* New non-FS arcologies: The player is given a random Hero Slave with a value of less than 100,000 at start.
* Cheat Start with a few random arcology slaves: The player is given 3-6 random Hero Slaves at start with no regards to value.
* The Special Slave Market ("Acquire other slaveowners' stock"): The slaves for purchase are the Hero Slaves. Hero slaves are purchased for twice their normal market value, with an addition of 10,000 to 30,000 for slaves who would otherwise cost under 20,000.

## Credits

Many of these Hero Slaves originally came from the /d/ database and have been carfully kept compatable with changes to FC by several people over the years. Notablely `DerangedLoner` and `BoneyM` have done a lot of work to keep these working.

## Editor Suggestions and Type Info

It is highly recommended to edit these files with an editor that supports ESLint, JavaScript, and TypeScript.
I recommend using VSCode with the following extensions installed:

* [IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode)
* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
* [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

Hero Slaves are of type `SlaveTemplate` which is a derivative of `SlaveState`. Any property that is valid in `SlaveState` is valid in Hero Slaves. A modern editor with the correct extensions will provide helpful documentation, type enforcement, and suggestions.

## Hero Slave Database File Locations

Hero Slaves are stored in one of the database files next to these instructions. All of these files start with `slavesDatabase_`.

The Hero Slave databases are split up into seperate files as follows:

* Gender: XX for Female, XY for Male.
* Extreme: Heros in these files are missing limbs or have other properties that would stop them from generating if the player has extreme content turned off.
  * See `Removing Limbs From Hero Slaves` below for more details.
* HyperPreg: Heros in these files have one or more genetic trait that would only be possible if the player has hyper pregnancy turned on.
* Incest: Heros in these files have an incestuous relationship with another hero slave.
* FruitGirls: Heros in these files are part of the fruit girls and should be kept as close to their original state as possible.
* Files with just the gender: Heros in these files don't fit into any of the other groups and should be safe for normal generation.
  * Pregnancy and underage are filtered out if needed regardless of what database the hero is defined in.

## WARNINGS ABOUT DEFAULTS

Any attribute omitted from a slave's data will take on the default value of SlaveState, its parent HumanState, or the latter's parent
GenePoolRecord, rather than taking advantage of the consistent logic in the global "GenerateNewSlave" function. Notably, the default age is
18, which is simple enough, and the default values of "intelligence" and "face" are 0, which represents average on a scale from -100 to 100.
However, in cases where the attribute is a list of categories, the usual default of 0 may have a surprising meaning.

Most importantly for females, a 0 for "vagina" or "anus" means a virgin or anal virgin, while a female slave with a 0 for "ovaries" will never
have gone through puberty (which won't stop normal breast and hip growth, because the game code isn't completely logical), and will have a 
neutral hormone balance (which really only affects opposite-sex attraction, but just looks weird in the slave summary).

Most importantly for males, a default of 0 for "dick" means no penis, and a male slave with a 0 for "balls" will be castrated, will never have
gone through puberty (which won't stop normal development of masculine traits), and will have a neutral hormone balance (which, again, really
only affects opposite-sex attraction, but just looks weird in the slave summary). A 0 for "anus" means an anal virgin, while a male slave with
the default value of 0 for "vagina" will have a vagina (and be a virgin), so make sure any natural male has a "vagina" of -1.

Finally, note that a slave with no explicit career will take on the career "a slave", implying that she's been a slave for a long time.

The moral of the story is, to be safe, set all values explicitly if possible (except possibly names--see below), but it's not a bad idea to
familiarize yourself with the defaults by having a look at 001-GenePoolRecord.js, 002-HumanState.js, and 003-SlaveState.js.

The one attribute that can't be omitted is "slaveName": a slave with no value for this attribute will end up with the name "blank", even if a
birth name is specified. Thus, if you want a slave to be called by her birth name, you need to set _both_ "slaveName" and "birthName" to that
value. If no birth name is provided, the game will pick a random name appropriate to the slave's nationality; you have to explicitly set 
"birthName" to "" (an empty string) to avoid any mention of a birth name in her description.

Surnames follow a similar logic: if the birth surname is missing, one will be picked randomly, but if it's set explicitly to "", the birth 
surname will be omitted from the description. Setting "slaveSurname" isn't required; if it's omitted, the slave's description will mention
that she lacks a surname as a slave, regardless of whether or not she has a birth surname. To remove all mentions of a surname from the 
description, set _both_ "slaveSurname" and "birthSurname" to "". However, if "slaveSurname" is set to "" and "birthSurname" is set to any
other value, the game will reset "slaveSurname" to the default, producing the same sort of description as if it had been omitted in the first
place.

## Making An Infertile Hero Slave

To make a female Hero Slave infertile, give her an "ovaries" value of 1, and a "preg" value of -2 ("sterile"). This value would apply even to non-permanent surgical interventions, while making a slave well and truly unable to have children is "sterilized", or -3.

To make a male Hero Slave infertile without castrating him, set "ballType" to "sterile".

## Removing Hero Slave limbs or making them prostetics

Hero Slaves with missing limbs need to go in one of the extreme databases.
Hero Slaves with prostetics can usually go into any of the databases.

To modify a Hero Slave's limbs you use the `_limbs` property.
This property is an array of 4 numbers. The positions are `[left arm, right arm, left leg, right leg]`. A 0 will remove that limb, while a 1 will keep it natural. Anything above 1 will set that limb to the prostetic corresponding to the given number. For example `[0, 0, 0, 0]` would remove all limbs from the given slave, `[0, 0, 1, 1]` would only remove the arms, and `[6, 6, 0, 1]` would make both arms cybernetic prostetics, remove the left leg, and keep the right leg natural.

See existing extreme slaves for examples.

Here are the different limb types available:

* 0: removed
* 1: normal
* 2: simple prosthetic
* 3: advanced - Sex
* 4: advanced - Beauty
* 5: advanced - Combat
* 6: cybernetic

## Families

Two slaves can be siblings (parent/child relationships can't easily be made to work with the Special Market, because the relationship is stored only on the child). To be siblings, two slaves must share at least one parent (a negative dummy ID, not the ID of a slave in the game--make sure it doesn't conflict with parent ID's already in the databases); it's helpful to match sure they match by setting their birth surname, race, and nationality explicitly, and setting twins' birth weeks explicitly.

Related slaves also require some additional code in the functions "App.Utils.getHeroFamilies" and "App.Utils.getHeroSlaves", both found in HeroCreator.js, and the family members do not have to be listed in the same file, but they do have to be in equivalent arrays ("vanilla", extreme, incest, or hyperpreg), so that either both or neither is eligible to show up in any particular game (which means that combining kinks, sadly, won't work--e.g., no incestuous amputees).

If the family members are listed in incest arrays (and in the incest-mapping object "incestFamilies" found in "getHeroFamilies"), their relationship attributes will automatically be set (to "friends with benefits") when they're acquired; there's no need to specify the relationship explicitly here.

To show up during arcology acquisition, two related slaves must have a _combined_ value of under 100,000; they will always show up together during acquisition, though they can be bought separately in the Special Market.

## Misc Notes

Most male Hero Slaves originally had a "preg" value of -2 ("sterile" for females). These assignments were removed in all but one case, as a "preg" value of -2 will cause the "isFertile" function to return "false" for an XY slave with an anal womb (XY slaves given ovaries aren't a problem, since "preg" is set to 0 when ovaries are implanted). -DerangedLoner
