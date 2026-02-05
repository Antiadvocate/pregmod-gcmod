Player variables documentation - Pregmod

Shares the vast majority of slave variables. Only ones in use are listed here. For more, see /player/js/playerState.js.

**anything labeled accepts string will return any string entered into it**

slaveName:

your first name
accepts string

slaveSurname:

your last name
accepts string
0 - no surname

title:

(common in events)
your title's gender
0 - female
1 - male

ID:

The player's ID is always -1.

genes:

Player's gender
"XY"
"XX"

degeneracy:

How strong/are there rumors about you doing unsavory things with your slaves
0	- 10	- occasional whispers
11	- 25	- minor rumors
26	- 50	- rumors
51	- 75	- bad rumors
70	- 100	- severe rumors
101+		- life ruining rumors

refreshment:

your favorite refreshment
accepts string

refreshmentType:

(uncommon in events)
The method of consumption of .refreshment
0 - smoked
1 - drank
2 - eaten
3 - snorted
4 - injected
5 - popped
6 - orally dissolved

career:

Your career before becoming owner

"rich kid"
"trust fund"
"wealth"

"business kid"
"entrepreneur"
"capitalist"

"child soldier"
"recruit"
"mercenary"

"slave tender"
"slave overseer"
"slaver"

"worksite helper"
"construction"
"engineer"

"nurse"
"medical assistant"
"medicine"

"child star"
"rising star"
"celebrity"

"script kiddy"
"hacker"
"BlackHat"

"child prostitute"
"prostitute"
"escort"

"child servant"
"handmaiden"
"servant"

"street urchin"
"hoodlum"
"gang"

"arcology owner"

rumor:

"wealth"
"diligence"
"force"
"social engineering"
"luck"

actualAge:

(uncommon in events)
your actualAge
14+

physicalAge:

your body's age
14+

visualAge:

(uncommon in events)
how old you look
14+

ovaryAge:

How old your ovaries are
Used to delay menopause temporarily

birthWeek:

your week of birth in a year
accepts int between 0-51

ageImplant:

have you had age altering surgery, not yet in use
0 - no
1 - yes

boobs:

(common in events)
0 - 299   - masculine chest (if title = 1) or flat chested (if title = 0)
300-399   - A-cup;
400-499   - B-cup
500-649   - C-cup
650-799   - D-cup
800-999   - DD-cup
1000-1199 - F-cup
1200-1399 - G-cup
1400-1599 - H-cup

boobsImplant:

Size, if any, of breast implants
0 - none
1+ - yes

boobsImplantType:

Implant type
"none"
"normal"
"string"
"fillable"
"advanced fillable"
"hyper fillable"

lactation:

is player lactating
0 - no
1 - yes

lactationDuration:

how many more weeks the player will lactate for
0+

butt:

how big your butt is
2 - normal
3 - big
4 - huge
5 - enormous

buttImplant:

do you have butt implants
0 - no
1+ - size

buttImplantType:

Implant type
"none"
"normal"
"string"
"fillable"
"advanced fillable"
"hyper fillable"

vagina:

(common in events)
Player has a pussy
-1 - no
0  - virgin
1  - tight
2  - reasonably tight
3  - loose
4  - cavernous

newVag:

have you had a loose vagina restored
0 - no
1 - yes

dick:

(common in events)
Player has a cock
0 - no
4 - big

balls:

how big your balls are (sizes above 0 requires dick == 1)
0  - none
3  - normal
5  - massive
9  - monstrous
14 - hypertrophied
30 - melons

ballsImplant:

how big your balls implants are (requires dick == 1)
0 - none
1+ size added

preg:

(uncommon in events)
How far along your pregnancy is (pregMood kicks in at 24+ weeks)
-2		menopausal
-1		contraceptives
 0		not pregnant
 1 - 42 pregnant
 43+	giving birth

pregType:

How many fetuses you are carrying
1 - 8

pregWeek:
How far along your pregnancy is. (used for postpartum)

pregKnown:

Do you know you are pregnant (currently unused due to lack of menstrual cycle)
0 - no
1 - yes

fertKnown:

Menstrual cycle known variable. To be used for fert cycle discover and things like pregnancy without a first period

0 - no
1 - yes

fertPeak:

Menstrual cycle control variable.

 0 - Danger week
1+ - safe week

belly:

(uncommon in events)
how big your belly is in CCs
thresholds
100	- bloated
1500	- early pregnancy
5000	- obviously pregnant
10000	- very pregnant
15000	- full term
30000	- full term twins
45000	- full term triplets
60000	- full term quads
75000	- full term quints
90000	- full term sextuplets
105000	- full term septuplets
120000	- full term octuplets

pregSource:

who knocked you up
 0 - unknown
-1 - self-impreg
-2 - citizen of your arcology
-3 - former master
-4 - male arc owner
-5 - client
-6 - Societal Elite
-7 - designer baby
-8 - an animal
-9 - futanari sister

pregMood:

(uncommon in events)($PC.preg >= 28)
how you act when heavily pregnant
0 - no change
1 - submissive and motherly
2 - aggressive and dominant

labor:

are you giving birth this week
0 - no
1 - yes

skill:

	trading:

	your trading skill
	accepts int between -100 and 100

	warfare:

	your warfare skill
	accepts int between -100 and 100

	hacking:

	your hacking skill
	accepts int between -100 and 100

	slaving:

	your slaving skill
	accepts int between -100 and 100

	engineering:

	your engineering skill
	accepts int between -100 and 100

	medicine:

	your medicine skill
	accepts int between -100 and 100

	cumTap:

	how acclimated you are to taking huge loads

race:

your race
accepts string

origRace:

your original race
accepts string

skin:

your skin color
accepts string

origSkin:

your original skin tone
accepts string

markings:

do you have markings?
"none"
"freckles"
"heavily freckled"

eye:
	right:/left:
		iris:

		your eye color
		accepts string

		pupil:

		your pupil shape
		accepts string

		sclerae:

		your sclerae color
		accepts string

	origColor:

	your genetic eye color
	accepts string

hColor:

your hair color
accepts string

origHColor:

your original hair color
accepts string

nationality:

your nationality
accepts string

father:

your father
Accepts ID
Values between 0 and -20 are reserved.
 0 - unknown

mother:

your mother
Accepts ID
Values between 0 and -20 are reserved.
 0 - unknown

sisters:

how many sisters you have

daughters:

how many daughters you have

counter:

	birthsTotal:

	how many children you've had
	accepts int

	abortions:

	number of abortions you've had
	accepts int

	miscarriages:

	number of miscarriage you've had
	accepts int

	birthElite:

	how many children you've carried for the SE

	birthMaster:

	how many children you've carried for your former master (servant start only)

	birthDegenerate:

	how many slave babies you've had

	birthClient:

	how many whoring babies you've had

	birthOther:

	untracked births

	birthArcOwner:

	how many children you've carried for other arc owners

	birthCitizen:

	how many children you've had by sex with citizens (not whoring)

	birthSelf:

	how many times you've giving birth to your own selfcest babies

	birthLab:

	how many designer babies you've produced

	birthFuta:

	how many babies you've had with the Futanari Sisters

	storedCum:

	How many units of your cum are stored away for artificially inseminating slaves

	laborCount:

	Have you experienced labor.

	slavesFathered:

	how many slave babies you are the father of

	slavesKnockedUp:

	how many slaves you've gotten pregnant

intelligence:

100

face:

100

lips:

lip size (0-100)
0  - 10 - thin
11 - 20 - normal
21 - 40 - pretty
41 - 70 - plush
71 - 95 - huge (lisps)
96 - 100- facepussy (mute)

lipsImplant:

how large her lip implants are
See .lips

reservedChildren:

how many of your children will be added to the incubator

reservedChildrenNursery:

how many of your children will be added to the nursery

fertDrugs:

are you on fertility supplements
0 - no
1 - yes

forcedFertDrugs:

have you been drugged with fertility drugs
0	- no
1+	- how many weeks they will remain in your system

sexualEnergy:

how much fucking you can do in a week
accepts int

staminaPills:

Are you taking pills to fuck more slaves each week?
0 - no
1 - yes

pubicHStyle:

Used for compatibility.
"hairless"

underArmHStyle:

Used for compatibility.
"hairless"

rules:
	living:

	Your starting expenses. Increases each NG+ until max. Keep in mind that this is in terms of an arcology owner.
	"spare"
	"normal"
	"luxurious"

	lactation:

	How you are handling your lactation?
	"none"
	"induce"
	"maintain"
	"sell"
