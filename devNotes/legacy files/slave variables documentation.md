
The variables below are outdated and will likely get even more outdated as time goes on.
Fully up to date variables can be found in the actual code at https://gitgud.io/pregmodfan/fc-pregmod/-/tree/pregmod-master/src/js/states.
Each of the files in the linked directory have a main class.
The main class's line looks kinda like `App.Entity.*State = class *State {`.
The GenePoolRecords class starts on line 240 of `001-GenePoolRecord.js` (as of this writing) and that line is `App.Entity.GenePoolRecord = class GenePoolRecord {` for example.
The files to pay the most attention to are as follows:

 - `001-GenePoolRecord.js`: This is where anything that describes a slaves physical features are likely to be stored
 - `002-HumanState.js`: Anything not in `001-GenePoolRecord.js` that applies to both the player character and slaves
 - `003-SlaveState.js`: Anything not in `001-GenePoolRecord.js` or `002-HumanState.js`

**anything labeled accepts string will return any string entered into it**

slaveName:

Slave's current name
accepts string

-1 - copy birthName

birthName:

slave's original name
accepts string

slaveSurname:

Slave's current surname
accepts string

-1 - copy birthSurname (make sure it is not "")

birthSurname:

slave's original surname
accepts string

genes:

slave sex
"XX"
"XY"

weekAcquired:

game week slave was acquired
accepts int
0 - Obtained prior to game start/at game start

origin:

slave's origin
accepts string

career:

career prior to enslavement
accepts string

App.Data.Careers.General.veryYoung
"a babysitter"
"a beggar"
"a bully hunter"
"a bully"
"a camp counselor"
"a cheerleader"
"a child actress"
"a child prodigy"
"a child prostitute"
"a child soldier"
"a club manager"
"a club recruiter"
"a club treasurer"
"a cum dump"
"a dropout"
"a drug mule"
"a farmer's daughter"
"a girl scout"
"a hall monitor"
"a handmaiden"
"a hospital volunteer"
"a housesitter"
"a juvenile delinquent"
"a latchkey kid"
"a lemonade stand operator"
"a marching band leader"
"a meat toilet"
"a military brat"
"a model-UN star"
"a model"
"a noblewoman"
"a pageant star"
"a paper girl"
"a part-time farm laborer"
"a pick-pocket"
"a refugee"
"a school nurse's assistant"
"a shrine maiden"
"a street thug"
"a street urchin"
"a student council president"
"a student from a boarding school"
"a student from a private school"
"a student from a public school"
"a sweatshop worker"
"a teacher's pet"
"an apprentice"
"an aspiring pop star"
"an idol"
"an orphan"
"being homeschooled by her parents"
"captain of the kendo club"
"from a lower class family"
"from a middle class family"
"from an upper class family"
"homeless"

App.Data.Careers.General.young
"a babysitter"
"a ballerina"
"a barista"
"a bartender"
"a beggar"
"a blogger"
"a butler"
"a camgirl"
"a camp counselor"
"a camwhore"
"a cashier"
"a cheerleader"
"a cocktail waitress"
"a comedian"
"a con artist"
"a cook"
"a courier"
"a cowgirl"
"a criminal"
"a croupier"
"a cum dump"
"a dairy worker"
"a dancer"
"a delivery woman"
"a dominatrix"
"a drug mule"
"a factory worker"
"a farm laborer"
"a farmer's daughter"
"a florist"
"a gang member"
"a gardener"
"a groomer"
"a gymnast"
"a handmaiden"
"a house DJ"
"a housesitter"
"a housewife"
"a law enforcement officer"
"a lifeguard"
"a magician's assistant"
"a maid"
"a mail-order bride"
"a masseuse"
"a meat toilet"
"a mechanic"
"a medical student"
"a mistress"
"a model"
"a musician"
"a noblewoman"
"a nun"
"a nurse"
"a paramedic"
"a party girl"
"a personal assistant"
"a personal trainer"
"a pirate"
"a political activist"
"a porn star"
"a prisoner"
"a programmer"
"a prostitute"
"a racing driver"
"a reality show star"
"a receptionist"
"a refugee"
"a ride attendant"
"a saleswoman"
"a school nurse"
"a secretary"
"a security guard"
"a service worker"
"a shrine maiden"
"a shut-in"
"a soldier"
"a street performer"
"a street vendor"
"a stripper"
"a student"
"a switchboard operator"
"a teaching assistant"
"a tour guide"
"a trophy wife"
"a truck driver"
"a video game streamer"
"a waitress"
"a wet nurse"
"a yoga instructor"
"an actress"
"an air hostess"
"an apprentice"
"an arcade attendant"
"an artist"
"an aspiring pop star"
"an assassin"
"an athlete"
"an au pair"
"an escort"
"an exotic dancer"
"an idol"
"an installation technician"
"an intern"
"an office worker"
"homeless"
"in a militia"
"unemployed"

App.Data.Careers.General.educated
"a ballerina"
"a banker"
"a bureaucrat"
"a business owner"
"a businessman"
"a captain"
"a chemist"
"a chief of police"
"a classical dancer"
"a classical musician"
"a coach"
"a college scout"
"a concierge"
"a coroner"
"a corporate executive"
"a cosmetologist"
"a counselor"
"a criminal"
"a critic"
"a cult leader"
"a dean"
"a dentist"
"a director"
"a dispatch officer"
"a doctor"
"a historian"
"a housekeeper"
"a journalist"
"a judge"
"a lawyer"
"a librarian"
"a lobbyist"
"a madam"
"a manager"
"a mechanic"
"a mediator"
"a medical student"
"a mercenary"
"a military officer"
"a military recruiter"
"a nanny"
"a noblewoman"
"a nun"
"a painter"
"a paramedic"
"a personal assistant"
"a pharmacist"
"a photographer"
"a physician"
"a pilot"
"a poet"
"a police detective"
"a police negotiator"
"a police officer"
"a political activist"
"a politician"
"a practitioner"
"a principal"
"a prison warden"
"a private detective"
"a private instructor"
"a procuress"
"a producer"
"a professional bartender"
"a professor"
"a programmer"
"a prostitute"
"a psychologist"
"a refugee"
"a scholar"
"a scientist"
"a sculptor"
"a secretary"
"a serial divorcee"
"a shut-in"
"a stockbroker"
"a surgeon"
"a teacher"
"a teaching assistant"
"a therapist"
"a train conductor"
"a transporter"
"a veterinarian"
"a wedding planner"
"a writer"
"a zookeeper"
"an actress"
"an air hostess"
"an animator"
"an archaeologist"
"an architect"
"an artist"
"an assassin"
"an astronaut"
"an economist"
"an editor"
"an engineer"
"an escort"
"an estate agent"
"an investor"
"an MS pilot"
"an office worker"
"an orchestra conductor"
"retired"
"unemployed"

App.Data.Careers.General.uneducated
"a baker"
"a barber"
"a barista"
"a bartender"
"a beekeeper"
"a beggar"
"a blacksmith"
"a blogger"
"a bodyguard"
"a bouncer"
"a bounty hunter"
"a boxer"
"a brewer"
"a bullfighter"
"a bus driver"
"a butcher"
"a butler"
"a camgirl"
"a camp counselor"
"a camwhore"
"a candlestick maker"
"a caregiver"
"a carpenter"
"a cashier"
"a charity worker"
"a chauffeur"
"a cheerleader"
"a chiropractor"
"a clown"
"a cobbler"
"a cocktail waitress"
"a comedian"
"a con artist"
"a construction worker"
"a cook"
"a cowgirl"
"a criminal"
"a croupier"
"a cum dump"
"a dairy worker"
"a dancer"
"a delivery woman"
"a dominatrix"
"a driller"
"a drug mule"
"a factory worker"
"a farm laborer"
"a farmer's daughter"
"a farmer"
"a firefighter"
"a fisherwoman"
"a florist"
"a fortune teller"
"a gang leader"
"a gang member"
"a gardener"
"a gravedigger"
"a groomer"
"a gymnast"
"a handmaiden"
"a hotel manager"
"a house DJ"
"a housewife"
"a hunter"
"a janitor"
"a landlady"
"a launderer"
"a law enforcement officer"
"a lifeguard"
"a local news anchor"
"a lumberjack"
"a magician's assistant"
"a maid"
"a mail carrier"
"a mail-order bride"
"a masseuse"
"a meat toilet"
"a medic"
"a medium"
"a messenger"
"a midwife"
"a milkmaid"
"a mime"
"a miner"
"a missionary"
"a mistress"
"a model"
"a mortician"
"a musician"
"a nanny"
"a nurse"
"a paramedic"
"a park ranger"
"a party girl"
"a peddler"
"a personal trainer"
"a pimp"
"a pirate"
"a plumber"
"a political activist"
"a prison guard"
"a prisoner"
"a procuress"
"a prostitute"
"a racing driver"
"a radio show host"
"a rancher"
"a receptionist"
"a referee"
"a refugee"
"a repairman"
"a revolutionary"
"a ride attendant"
"a roadie"
"a rodeo star"
"a sailor"
"a saleswoman"
"a school nurse"
"a seamstress"
"a secretary"
"a security guard"
"a service worker"
"a shepherd"
"a shrine maiden"
"a soldier"
"a stage magician"
"a street performer"
"a street vendor"
"a stripper"
"a student"
"a student athlete"
"a stuntwoman"
"a switchboard operator"
"a tailor"
"a talent scout"
"a taxi driver"
"a teacher"
"a tour guide"
"a trophy wife"
"a truck driver"
"a waitress"
"a weathergirl"
"a welder"
"a wet nurse"
"a whaler"
"a wrestler"
"a zookeeper"
"an acrobat"
"an actress"
"an arcade attendant"
"an artist"
"an aspiring pop star"
"an athlete"
"an electrician"
"an enforcer"
"an escort"
"an exotic dancer"
"an exterminator"
"an innkeeper"
"an installation technician"
"an office worker"
"an orderly"
"homeless"
"in a militia"
"retired"
"unemployed"

App.Data.Careers.General.grateful
"a beggar"
"a drug mule"
"a peddler"
"a pick-pocket"
"a prisoner"
"a refugee"
"a shut-in"
"a street urchin"
"a student from a boarding school"
"a sweatshop worker"
"a thief"
"an orphan"
"from a lower class family"
"homeless"
"unemployed"

App.Data.Careers.General.menial
"a baker"
"a blacksmith"
"a bus driver"
"a butcher"
"a candlestick maker"
"a carpenter"
"a cashier"
"a chauffeur"
"a cobbler"
"a construction worker"
"a courier"
"a croupier"
"a delivery woman"
"a driller"
"a dropout"
"a factory worker"
"a farm laborer"
"a firefighter"
"a fisherwoman"
"a florist"
"a gardener"
"a gravedigger"
"a janitor"
"a launderer"
"a lumberjack"
"a mail carrier"
"a mechanic"
"a messenger"
"a miner"
"a nun"
"a paper girl"
"a part-time farm laborer"
"a pilot"
"a plumber"
"a private"
"a programmer"
"a receptionist"
"a referee"
"a repairman"
"a ride attendant"
"a roadie"
"a sailor"
"a seamstress"
"a service worker"
"a street vendor"
"a student from a private school"
"a student from a public school"
"a student"
"a switchboard operator"
"a tailor"
"a taxi driver"
"a terrorist"
"a tour guide"
"a train conductor"
"a truck driver"
"a welder"
"a whaler"
"an apprentice"
"an arcade attendant"
"an electrician"
"an engineer"
"an exterminator"
"an installation technician"
"an intern"

App.Data.Careers.General.entertainment
"a ballerina"
"a blogger"
"a camgirl"
"a camwhore"
"a cheerleader"
"a child actress"
"a clown"
"a cocktail waitress"
"a comedian"
"a gymnast"
"a journalist"
"a local news anchor"
"a magician's assistant"
"a medium"
"a mime"
"a painter"
"a party girl"
"a photographer"
"a poet"
"a racing driver"
"a sculptor"
"a stage magician"
"a street performer"
"a student athlete"
"a stuntwoman"
"a video game streamer"
"a waitress"
"a weathergirl"
"a wrestler"
"a writer"
"an acrobat"
"an actress"
"an animator"
"an artist"
"an athlete"

App.Data.Careers.General.whore
"a bimbo"
"a child prostitute"
"a criminal"
"a cum dump"
"a Futanari Sister"
"a juvenile delinquent"
"a mail-order bride"
"a meat toilet"
"a mistress"
"a model"
"a pageant star"
"a pirate"
"a porn star"
"a prostitute"
"a reality show star"
"a saleswoman"
"a serial divorcee"
"a stripper"
"a trophy wife"
"an escort"
"an exotic dancer"

App.Data.Careers.Leader.HG
"a captain"
"a corporate executive"
"a director"
"a dominatrix"
"a gang leader"
"a judge"
"a lawyer"
"a leading arcology citizen"
"a military officer"
"a model-UN star"
"a noblewoman"
"a politician"
"a Queen"
"a slaver"
"a student council president"

 App.Data.Careers.Leader.madam
"a banker"
"a business owner"
"a businessman"
"a camp counselor"
"a club manager"
"a hotel manager"
"a landlady"
"a madam"
"a manager"
"a park ranger"
"a pimp"
"a procuress"
"a stockbroker"
"an innkeeper"

 App.Data.Careers.Leader.DJ
"a classical dancer"
"a classical musician"
"a dancer"
"a house DJ"
"a marching band leader"
"a musician"
"a radio show host"
"an aspiring pop star"
"an idol"
"an orchestra conductor"

 App.Data.Careers.Leader.bodyguard
"a bodyguard"
"a boxer"
"a bully hunter"
"a child soldier"
"a hitman"
"a kunoichi"
"a law enforcement officer"
"a military brat"
"a prince"
"a revolutionary"
"a sniper"
"a soldier"
"a transporter"
"an assassin"
"an MS pilot"
"captain of the kendo club"
"in a militia"
"spec ops"

 App.Data.Careers.Leader.wardeness
"a bouncer"
"a bounty hunter"
"a bully"
"a chief of police"
"a gang member"
"a hall monitor"
"a mercenary"
"a police detective"
"a police officer"
"a prison guard"
"a prison warden"
"a private detective"
"a security guard"
"a street thug"
"an enforcer"
"an orderly"

 App.Data.Careers.Leader.nurse
"a chemist"
"a chiropractor"
"a coroner"
"a dentist"
"a doctor"
"a hospital volunteer"
"a medic"
"a medical student"
"a midwife"
"a mortician"
"a nurse"
"a paramedic"
"a pharmacist"
"a physician"
"a school nurse's assistant"
"a school nurse"
"a surgeon"

 App.Data.Careers.Leader.attendant
"a barber"
"a cosmetologist"
"a counselor"
"a dispatch officer"
"a fortune teller"
"a groomer"
"a latchkey kid"
"a lifeguard"
"a masseuse"
"a mediator"
"a personal trainer"
"a police negotiator"
"a psychologist"
"a therapist"
"a yoga instructor"

 App.Data.Careers.Leader.matron
"a babysitter"
"a nanny"
"a practitioner"
"a wet nurse"
"an au pair"

 App.Data.Careers.Leader.milkmaid
"a cowgirl"
"a dairy worker"
"a farmer's daughter"
"a milkmaid"
"a shepherd"
"a veterinarian"

 App.Data.Careers.Leader.farmer
"a beekeeper"
"a bullfighter"
"a farmer"
"a farmhand"
"a rancher"
"a rodeo star"
"a zookeeper"

 App.Data.Careers.Leader.stewardess
"a barista"
"a bartender"
"a brewer"
"a bureaucrat"
"a caregiver"
"a charity worker"
"a club treasurer"
"a concierge"
"a critic"
"a housekeeper"
"a housesitter"
"a lemonade stand operator"
"a personal assistant"
"a professional bartender"
"a secretary"
"a wedding planner"
"an air hostess"
"an architect"
"an editor"
"an estate agent"
"an investor"
"an office worker"

 App.Data.Careers.Leader.schoolteacher
"a child prodigy"
"a coach"
"a dean"
"a historian"
"a librarian"
"a principal"
"a private instructor"
"a professor"
"a scholar"
"a scientist"
"a teacher's pet"
"a teacher"
"a teaching assistant"
"an archaeologist"
"an astronaut"
"an economist"

 App.Data.Careers.Leader.recruiter
"a club recruiter"
"a college scout"
"a con artist"
"a cult leader"
"a girl scout"
"a hunter"
"a lobbyist"
"a military recruiter"
"a missionary"
"a political activist"
"a princess"
"a spy"
"a talent scout"
"retired"

 App.Data.Careers.Leader.servant
"a butler"
"a cook"
"a handmaiden"
"a housewife"
"a maid"
"a shrine maiden"

ID:

slave's ID
accepts int

prestige:

slave's prestige
0 - no prestige
1 - Prestigious
2 - Very prestigious
> 2 - Extremely prestigious

rules:

None RA rules related to a slave. Has the following properties:

rules.lactation :

"none"
"induce"
"maintain"

rules.living:

"spare"
"normal"
"luxurious"

rules.rest:

"none"			- slave may be worked into exhaustion
"cruel"			- slave is allowed rest when exhausted
"restrictive"	- slave is allowed to rest when fatigued
"permissive"	- slave is allowed to rest when tired
"mandatory"		- day of rest each week to recover

rules.mobility

"restrictive"	- slave is forced to crawl should she grow too large to walk
"permissive"	- slave is allowed to use carts and such to carry her weight should she grow too large to walk

rules.relationship:

"restrictive"
"just friends"
"permissive"

rules.release:

Release rules control who a slave is allowed to routinely fuck "off-camera."  0 forbids sexual contact in that category, 1 allows it.
Narrower categories generally override broader ones, but a slave who is forbidden sexual contact with close family will avoid developing a friendship with a family member into a romantic partnership.

masturbation: 0/1
partner: 0/1
family: 0/1
slaves: 0/1
master: 0/1

rules.speech :

"restrictive"
"permissive"
"accent elimination"
"language lessons"

rules.punishment :

"confinement"
"whipping"
"chastity"
"situational"

rules.reward:

"relaxation"
"drugs"
"orgasm"
"situational"

porn:

porn performance of the slave. Has the following properties:

porn.feed:

is the studio outputting porn of her?
0 - no
1 - yes

porn.viewerCount:

how famous her porn is?
accepts int

porn.spending:

how much money is being spent on promoting her porn
accepts int

porn.prestige:

how famous she is in porn
0 - not
1 - some
2 - recognized
3 - world renowned

porn.prestigeDesc:

description to go with above pornPrestige
accepts string

porn.fameType:

what porn she is known for
"none"
"orgasm denial"
"cum addiction"
"anal addiction"
"exhibition"
"breast expansion"
"abuse"
"sexual torture"
"self hating"
"breeder"
"submissive"
"cum"
"buttslut"
"humiliating"
"breast"
"dominant"
"sadistic"
"masochistic"
"pregnancy fetish"
"fuckdoll"
"rape"
"preggo"
"BBW"
"underage"
"weight gain"
"big dick"
"muscle"
"taboo"
"generic"
"deepthroat"
"unwilling"
"hardcore anal"
"softcore"
"romantic"
"really perverted"
"voyeur"
"unspeakable"
"huge insertion"

porn.focus:

what aspect of her the upgraded studio is focusing on for porn
"none"
"neglectful"
"cum addict"
"anal addict"
"attention whore"
"breast growth"
"abusive"
"malicious"
"self hating"
"breeder"
"submissive"
"cumslut"
"buttslut"
"humiliation"
"boobs"
"dom"
"sadist"
"masochist"
"pregnancy"
"fuckdoll"
"rape"
"preggo"
"BBW"
"loli"
"gainer"
"stud"
"muscle"
"incest"
"porn"
"gagfuck queen"
"strugglefuck queen"
"painal queen"
"tease"
"romantic"
"perverted"
"caring"
"unflinching"
"size queen"

porn.fame.general:

generic porn fame
accepts int

porn.fame.fuckdoll:

fuckdoll porn fame
accepts int

porn.fame.rape:

rape porn fame
accepts int

porn.fame.preggo:

preggo porn fame
accepts int

porn.fame.BBW:

BBW porn fame
accepts int

porn.fame.gainer:

weight gain porn fame
accepts int

porn.fame.stud:

well hung porn fame
accepts int

porn.fame.muscle:

muscle porn fame
accepts int

porn.fame.incest:

incest porn fame
accepts int

porn.fame.loli:

underage porn fame
accepts int

porn.fame.deepThroat:

gagfuck queen porn fame
accepts int

porn.fame.struggleFuck:

strugglefuck queen porn fame
accepts int

porn.fame.painal:

painal queen porn fame
accepts int

porn.fame.tease:

tease porn fame
accepts int

porn.fame.romantic:

romantic porn fame
accepts int

porn.fame.pervert:

pervert porn fame
accepts int

porn.fame.caring:

caring porn fame
accepts int

porn.fame.unflinching:

unflinching porn fame
accepts int

porn.fame.sizeQueen:

size queen porn fame
accepts int

porn.fame.neglectful:

neglectful porn fame
accepts int

porn.fame.cumAddict:

cum addict porn fame
accepts int

porn.fame.analAddict:

anal addict porn fame
accepts int

porn.fame.attentionWhore:

attention whore porn fame
accepts int

porn.fame.breastGrowth:

breast growth porn fame
accepts int

porn.fame.abusive:

abusive porn fame
accepts int

porn.fame.malicious:

malicious porn fame
accepts int

porn.fame.selfHating:

self hating porn fame
accepts int

porn.fame.breeder:

breeder porn fame
accepts int

porn.fame.sub:

submissive porn fame
accepts int

porn.fame.cumSlut:

cumslut porn fame
accepts int

porn.fame.anal:

buttslut porn fame
accepts int

porn.fame.humiliation:

humiliation porn fame
accepts int

porn.fame.boobs:

boob porn fame
accepts int

porn.fame.dom:

dom porn fame
accepts int

porn.fame.sadist:

sadist porn fame
accepts int

porn.fame.masochist:

masochist porn fame
accepts int

porn.fame.pregnancy:

pregnancy porn fame
accepts int

prestigeDesc:

reason for prestige
accepts string
"$He is notorious as a former abolitionist turned devoted slave."
"$He is remembered for winning best in show as a cockmilker."
"$He is remembered for winning best in show as a dairy cow."
"$He is remembered for winning best in show as a breeder."
"$He is a famed Free Cities slut, and can please anyone."
"$He is a famed Free Cities whore, and commands top prices."

relationship:

slave's relationship
-3 - married to you
-2 - emotionally bound to you
-1 - emotional slut
 0 - none
 1 - friends with relationshipTarget
 2 - best friends with relationshipTarget
 3 - friends with benefits with relationshipTarget
 4 - lover with relationshipTarget
 5 - relationshipTarget's slave wife

relationshipTarget:

target of relationship
accepts ID

rivalry:

slave's rivalry
0 - none
1 - dislikes rivalryTarget
2 - rival of rivalryTarget
3 - bitterly hates rivalryTarget

rivalryTarget:

target of rival
accepts ID

subTarget:

slave will serve subTarget
accepts ID

choosesOwnAssignment:

can slave choose own assignment
0 - no
1 - yes

assignment:

slave's assignment
	Unassigned to facility:
		"rest"
		"be a servant"
		"get milked"
		"serve the public"
		"please you"
		"whore"
		"take classes"
		"stay confined"
		"work a glory hole"
		"be a subordinate slave"

	Assigned to facility:
		"rest in the spa"
		"work as a nanny"
		"work as a servant" (Servants' Quarters)
		"work in the dairy"
		"work as a farmhand"
		"serve in the club"
		"serve in the master suite"
		"work in the brothel"
		"learn in the schoolroom"
		"be confined in the cellblock"
		"be confined in the arcade"
		"get treatment in the clinic"
		"live with your agent"
		"live with your Head Girl"

	Leadership positions:
		"be the Attendant"
		"be the Matron"
		"be the Stewardess"
		"be the Milkmaid"
		"be the Farmer"
		"be the DJ"
		"be your agent"
		"be your Concubine"
		"be the Madam"
		"be the Schoolteacher"
		"be the Wardeness"
		"be the Nurse"
		"be your Head Girl"
		"guard you"
		"recruit girls"

sentence:

how many weeks a slave is sentenced to work a job
accepts int

training:
how far along slave is with being trained (skills, flaws, quirks)


toyHole:

which hole to focus on when serving you
"all her holes"
"mouth"
"boobs"
"pussy"
"ass"
"dick"

indenture:

How long her servitude will be.
-1 - not
 0+ - number of weeks remaining

indentureRestrictions:

2 - complete protection
1 - some protection
0 - no protection

birthWeek:

week she was born
int between 0-51

actualAge:

How old she really is.
Accepts int
starting retirement age is 45

physicalAge:

How old her body is.
Accepts int

visualAge:

How old her body looks.
Accepts int

ageAdjust:

progress towards modifying visualAge
Accepts int
-40 - add 1 to visualAge
+40 - subtract 1 from visualAge

ovaryAge:
How old her ovaries are. (used to trick menopause)
Accepts int


ageImplant:

has had facial surgery to reduce age
0 - no
1 - yes

health.condition:

slave's general fitness. Ranges from -100 to 100+

health.shortDamage:

slave's accumulated temporary health damage. Healed simply by time, curatives and job with no/light duties. Reduces condition and if large enough also increases longDamage.

health.longDamage:

slave's accumulated permanent health damage

health.illness:

slave's illness state
0 - Not ill
1 - A little under the weather, not really ill but still a minor penalty which most likely clears up the following week
2 - Slightly ill, small penalty and can be treated at the clinic
3 - ill, medium penalty and can be treated at the clinic
4 - very ill, large penalty and can be treated at the clinic
5 - terribly ill, crippling penalty and can be treated at the clinic

health.tired:

slave's level of exhaustion
0 - 30 - No effect
31 - 60 - Tired, increase in devotion or trust, depending on circumstances
61 - 90 - Fatigued, penalty to productivity and health and increase in devotion/fear
91 - 100 - Exhausted, major penalty to productivity, health and devotion/trust unless handled

health.health:

slave's overall health taking into account condition minus damages
-90-	   - On the edge of death
-90 - -51  - Extremely unhealthy
-50 - -21  - Unhealthy
-20 -  20  - Healthy
21  -  50  - Very healthy
50  -  90  - Extremely healthy
90		 - Unnaturally healthy

minorInjury:

slave has a minor injury
accepts string
"black eye"
"bruise"
"split lip"

trust:

slave's trust
-96-		- abjectly terrified
-95  - -51  - terrified
-50  - -21  - frightened
-20  -  20  - fearful
 21  -  50  - careful
 51  -  95  - trusting
 96+		- profoundly trusting

oldTrust:

used to calculate trust loss/gain
set to trust to start

devotion:

slave's devotion
-96-		- hate-filled
-95  - -51  - hateful
-50  - -21  - reluctant
-20  -  20  - careful
 21  -  50  - accepting
 51  -  95  - devoted
 96+		- worshipful

oldDevotion:

used to calculate devotion loss/gain
set to devotion to start

weight:

slave's weight

 191+	   - dangerously obese
 190 - 161  - super obese
 160 - 131  - obese
 130 -  96  - fat
 95  -  31  - overweight
 30  -  11  - curvy
 10  - -10  - neither too fat nor too skinny
-11  - -30  - thin
-31  - -95  - very thin
-96-		- emaciated

muscles:

slave's muscles
96+		- extremely muscular
51  - 95   - muscular
31  - 50   - fit
6   - 30   - toned
-5  - 5	- none
-30 - -6   - weak
-95 - -31  - very weak
-96-	   - frail

height:

accepts int
slave's height in cm
<150	 - petite
150-159  - short
160-169  - average
170-185  - tall
186+	 - very tall

heightImplant:

slave has height implant
-1 - -10 cm
0  - none
1  - +10 cm

nationality:

slave's nationality
accepts string
"slave"
"Afghan"
"Albanian"
"Algerian"
"American"
"Andorran"
"Angolan"
"Antiguan"
"Argentinian"
"Armenian"
"Aruban"
"Australian"
"Austrian"
"Azerbaijani"
"Bahamian"
"Bahraini"
"Bangladeshi"
"Barbadian"
"Belarusian"
"Belgian"
"Belizean"
"Beninese"
"Bermudian"
"Bhutanese"
"Bissau-Guinean"
"Bolivian"
"Bosnian"
"Brazilian"
"British"
"Bruneian"
"Bulgarian"
"Burkinabé"
"Burmese"
"Burundian"
"Cambodian"
"Cameroonian"
"Canadian"
"Cape Verdean"
"Catalan"
"Central African"
"Chadian"
"Chilean"
"Chinese"
"Colombian"
"Comorian"
"Congolese"
"a Cook Islander"
"Costa Rican"
"Croatian"
"Cuban"
"Curaçaoan"
"Cypriot"
"Czech"
"Danish"
"Djiboutian"
"Dominican"
"Dominiquais"
"Dutch"
"East Timorese"
"Ecuadorian"
"Egyptian"
"Emirati"
"Equatoguinean"
"Eritrean"
"Estonian"
"Ethiopian"
"Fijian"
"Filipina"
"Finnish"
"French"
"French Guianan"
"French Polynesian"
"Gabonese"
"Gambian"
"Georgian"
"German"
"Ghanan"
"Greek"
"Greenlandic"
"Grenadian"
"Guamanian"
"Guatemalan"
"Guinean"
"Guyanese"
"Haitian"
"Honduran"
"Hungarian"
"I-Kiribati"
"Icelandic"
"Indian"
"Indonesian"
"Iranian"
"Iraqi"
"Irish"
"Israeli"
"Italian"
"Ivorian"
"Jamaican"
"Japanese"
"Jordanian"
"Kazakh"
"Kenyan"
"Kittitian"
"Korean"
"Kosovan"
"Kurdish"
"Kuwaiti"
"Kyrgyz"
"Laotian"
"Latvian"
"Lebanese"
"Liberian"
"Libyan"
"a Liechtensteiner"
"Lithuanian"
"Luxembourgian"
"Macedonian"
"Malagasy"
"Malawian"
"Malaysian"
"Maldivian"
"Malian"
"Maltese"
"Marshallese"
"Mauritanian"
"Mauritian"
"Mexican"
"Micronesian"
"Moldovan"
"Monégasque"
"Mongolian"
"Montenegrin"
"Moroccan"
"Mosotho"
"Motswana"
"Mozambican"
"Namibian"
"Nauruan"
"Nepalese"
"New Caledonian"
"a New Zealander"
"Ni-Vanuatu"
"Nicaraguan"
"Nigerian"
"Nigerien"
"Niuean"
"Norwegian"
"Omani"
"Pakistani"
"Palauan"
"Palestinian"
"Panamanian"
"Papua New Guinean"
"Paraguayan"
"Peruvian"
"Polish"
"Portuguese"
"Puerto Rican"
"Qatari"
"Romanian"
"Russian"
"Rwandan"
"Sahrawi"
"Saint Lucian"
"Salvadoran"
"Sammarinese"
"Samoan"
"São Toméan"
"Saudi"
"Scottish"
"Senegalese"
"Serbian"
"Seychellois"
"Sierra Leonean"
"Singaporean"
"Slovak"
"Slovene"
"a Solomon Islander"
"Somali"
"South African"
"South Sudanese"
"Spanish"
"Sri Lankan"
"Sudanese"
"Surinamese"
"Swazi"
"Swedish"
"Swiss"
"Syrian"
"Taiwanese"
"Tajik"
"Tanzanian"
"Thai"
"Tibetan"
"Togolese"
"Tongan"
"Trinidadian"
"Tunisian"
"Turkish"
"Turkmen"
"Tuvaluan"
"Ugandan"
"Ukrainian"
"Uruguayan"
"Uzbek"
"Vatican"
"Venezuelan"
"Vietnamese"
"Vincentian"
"Yemeni"
"Zairian"
"Zambian"
"Zimbabwean"


race:

slave's race
accepts string
"white"
"asian"
"latina"
"black"
"pacific islander"
"southern european"
"amerindian"
"malay"
"semitic"
"middle eastern"
"indo-aryan"
"mixed race"
"catgirl" - catmod exclusive

origRace:

slave's original race
accepts string

pubicHColor:

pubic hair color
accepts string

skin:

skin color
accepts string

"pure white"
"ivory"
"white"
"extremely pale"
"very pale"
"pale"
"extremely fair"
"very fair"
"fair"
"light"
"light olive"
"tan"
"olive"
"bronze"
"dark olive"
"dark"
"light beige"
"beige"
"dark beige"
"light brown"
"brown"
"dark brown"
"black"
"ebony"
"pure black"
"sun tanned"
"spray tanned"
"black and white striped" -- catmod exclusive
"yellow" -- catmod exclusive
"red" -- catmod exclusive

origSkin:

Slave's original skin color.
accepts string

markings:

slave markings
accepts string
"beauty mark"
"birthmark"
"freckles"
"heavily freckled"

eye:
Object, for easy read/write access see "devNotes/eye functions.md"

eye.origColor:
genetic eye color

left/right interchangeable in the following:
eye.left.vision:
0: blind
1: nearsighted
2: normal

eye.left.type:
1: normal
2: glass
3: cybernetic

eye.left.iris:
basic eye color:

"blue"
"black"
"brown"
"green"
"turquoise"
"sky-blue"
"hazel"
"pale-grey"
"white"
"pink"
"amber"
"red"

eye.left.pupil:
shape of pupil

"catlike"
"serpent-like"
"devilish"
"demonic"
"hypnotic"
"heart-shaped"
"wide-eyed"
"almond-shaped"
"bright"
"teary"
"vacant"
"circular"
"star-shaped"
"goat-like"

eye.left.sclera:
color of sclera

"white"
"blue"
"black"
"brown"
"green"
"turquoise"
"sky-blue"
"hazel"
"pale-grey"
"pink"
"amber"
"red"
"yellow"
"orange"

eyewear:

accepts string
"none"
"glasses"
"blurring glasses"
"corrective glasses"
"blurring contacts"
"corrective contacts"

hears:

slave hearing
-2 - deaf
-1 - hard of hearing
 0 - normal

earwear:

accepts string
"none"
"hearing aids"
"muffling ear plugs"
"deafening ear plugs"

earImplant:

is there an inner ear implant device
0 - no
1 - yes

earShape:

the shape of their outer ears
"none"
"damaged"
"normal"
"pointy"
"elven"
"ushi"

earT:

type of kemonomimi ears if any
"none"
"neko"
"inu"
"kit"
"tanuki"
"normal"
"usagi"

earTColor:

kemonomimi ear color
accepts hColor strings
"hairless"

smells:

sense of smell
-1 - no
0 - yes

tastes:

sense of taste
-1 - no
0 - yes


horn:

horn type if any
"none"
"curved succubus horns"
"backswept horns"
"cow horns"
"one long oni horn"
"two long oni horns"
"small horns"

hornColor:

horn color
accepts string

PTail:

Does she have a tail interface installed
0: no
1: yes

tail:

type of tail installed
"none"
"mod"
"combat"
"sex"

tailShape:

the current shape of their modular tail
"none"
"neko"
"inu"
"kit"
"kitsune"
"tanuki"
"ushi"
"usagi"
"risu"
"uma"

tailColor:

tail color
accepts hColor strings

origHColor:

slave's original hair color, defaults to their initial hair color.

hColor:

hair color
accepts string
"blonde"
"golden"
"platinum blonde"
"strawberry-blonde"
"copper"
"ginger"
"red"
"green"
"blue"
"pink"
"dark brown"
"brown"
"auburn"
"burgundy"
"chocolate brown"
"chestnut"
"hazel"
"black"
"grey"
"silver"
"white"

hLength:

hair length
accepts int
150	 - calf-length
149-100 - ass-length
99-30   - long
29-15   - shoulder-length
14-0	- short

hStyle:

hair style
accepts string
"shaved"
"buzzcut"
"trimmed"
"afro"
"cornrows"
"bun"
"neat"
"strip"
"tails"
"up"
"ponytail"
"braided"
"dreadlocks"
"permed"
"curled"
"luxurious"
"bald"
"messy bun"
"messy"
"undercut"
"bangs"
"hime"
"drills"

pubicHStyle:

pubic hair style
accepts string
"hairless"
"waxed"
"in a strip"
"neat"
"bushy"
"very bushy"
"bushy in the front and neat in the rear"
"bald"

waist:

slave waist
 96+	   - masculine
 95 -  41  - ugly
 40 -  11  - unattractive
 10 - -10  - average
-11 - -40  - feminine
-40 - -95  - hourglass
-96-	   - absurd

corsetPiercing:

series of rings up the back that can be tied together
0 - no
1 - yes

(leg|arm).(right|left).type:

individual limb state
0 - missing limb
1 - natural
2 - simple prosthetic
3 - advanced - Sex
4 - advanced - Beauty
5 - advanced - Combat
6 - cybernetic

PLimb:

What level of prosthetic interface she has installed
0 - no interface
1 - basic interface
2 - advanced interface
3 - quadruped interface

heels:

are heels clipped
0 - no
1 - yes

voice:

slave voice
0 - mute
1 - deep
2 - feminine
3 - high, girly

voiceImplant:

has voice implant
0 - no
1 - yes, high
-1 - yes, low

electrolarynx:

has cybernetic voicebox
0 - no
1 - yes

accent:

slave accent
0 - none
1 - cute accent
2 - accent
3 - bad accent
4 - no language skills

shoulders:

shoulder width
-2 - very narrow
-1 - narrow
 0 - feminine
 1 - broad
 2 - very broad

shouldersImplant:

has shoulder implant
-1 - shoulders -1
 0 - none
 1 - shoulders +1

boobs:

slave boob size
0-299	 - flat
300-399   - A-cup
400-499   - B-cup
500-649   - C-cup
650-799   - D-cup
800-999   - DD-cup
1000-1199 - F-cup
1200-1399 - G-cup
1400-1599 - H-cup
1600-1799 - I-cup
1800-2049 - J-cup
2050-2299 - K-cup
2300-2599 - L-cup
2600-2899 - M-cup
2900-3249 - N-cup
3250-3599 - O-cup
3600-3949 - P-cup
3950-4299 - Q-cup
4300-4699 - R-cup
4700-5099 - S-cup
5100-10499- massive

boobsMilk:

breast engorgement from unmilked tits
accepts int

boobsImplant:

slave implant size
0	      - no implants
1-199	  - small implants
200-399   - normal implants
400-599   - large implants
600-799	  - huge implants
800-999	  - giant implants
1000+     - massive implants

boobsImplantType:

Implant type
"none"
"normal"
"string"
"fillable"
"advanced fillable"
"hyper fillable"

boobShape:

breast shape
accepts string
"normal"
"perky"
"saggy"
"torpedo-shaped"
"downward-facing"
"wide-set"
"spherical"

nipples:

nipple shape
accepts string
"huge"
"puffy"
"inverted"
"tiny"
"cute"
"partially inverted"
"fuckable"
"flat"

nipplesPiercing:

nipple are pierced
0 - none
1 - yes
2 - heavily

nipplesAccessory:

what accessory, if any, or on her nipples
"none"

areolae:

slave areolae
0 - normal
1 - large
2 - unusually wide
3 - huge
4 - massive

areolaeShape:

slave areolae shape
accepts string

"heart"
"star"
"circle"

areolaePiercing:

edge of areolae are pierced
0 - none
1 - yes
2 - heavy

boobsTat:

boobs tattoo
takes one of the following strings or 0

"tribal patterns"
"flowers"
"scenes"
"Asian art"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"


lactation:

slave lactation
0 - none
1 - natural
2 - implant

lactationDuration:

how many more weeks until lactation dries up
usually 2 as interactions and lactation implant reset it to 2
accepts int

induceLactation:

odds of inducing lactation
begins trying on breast play if over 10
accepts int

lactationAdaptation:

0  - 10  - not used to producing milk (no bonuses)
11 - 50  - used to producing milk
51 - 100 - heavily adapted to producing milk (big bonus)

hips:

hip size
-2 - very narrow
-1 - narrow
 0 - normal
 1 - wide hips
 2 - very wide hips
 3 - inhumanly wide hips

hipsImplant:

slave has hip implant
-1 - hips -1
 0 - none
 1 - hips +1

butt:

butt size
0	   - flat
1      - slightly less flat
2	   - small
3	   - big
4	   - large
5	   - huge
6	   - enormous
7	   - gigantic
8	   - ridiculous
9 - 10 - immense
11 - 20- inhuman

*Descriptions vary for just how big 2 is, as such, it may be better to just go with 3

buttImplant:

butt implant size
0  - none
1  - butt implant
2  - big butt implant
3+ - massive butt implant

buttImplantType:

Implant type
"none"
"normal"
"string"
"fillable"
"advanced fillable"
"hyper fillable"

buttTat:

butt tattoo
takes one of the following strings or 0

"tribal patterns"
"flowers"
"scenes"
"Asian art"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"

face:

face attractiveness
-96-	   - very ugly
-95 - -41  - ugly
-40 - -11  - unattractive
-10 -  10  - attractive
 11 -  40  - very pretty
 41 -  95  - gorgeous
 96+	   - mind blowing

faceImplant:

facial surgery degree
0  - 14 - none
15 - 34 - Subtle Improvements
35 - 64 - Noticeable Work
65 - 99 - Heavily Reworked
100	 - Uncanny Valley

faceShape:

accepts string (will be treated as "normal")
"normal"
"masculine"
"androgynous"
"cute"
"sensual"
"exotic"
"feline" -- catmod exclusive

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

lipsPiercing:

lips pierced
0 - no
1 - yes
2 - heavy

lipsTat:

lip tattoo
takes one of the following strings or 0

"tribal patterns"
"flowers"
"permanent makeup"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"

teeth:

teeth type
accepts string
"normal"
"crooked"
"gapped"
"straightening braces"
"cosmetic braces"
"removable"
"pointy"
"baby"
"mixed"

vagina:

vagina type
-1 - no vagina
 0 - virgin
 1 - tight
 2 - reasonably tight
 3 - loose
 4 - cavernous
10 - ruined

vaginaLube:

how wet she is
0 - dry
1 - wet
2 - soaking wet

vaginaTat:

vagina tattoo
takes one of the following strings or 0

"tribal patterns"
"flowers"
"scenes"
"Asian art"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"
"lewd crest"

preg:

pregnancy time or state. See Pregnancy Control section for more.
-3	- sterilized
-2	- sterile
-1	- contraceptives
 0	- fertile
1-10  - pregnant, not showing
11-20 - showing
21-30 - pregnant
30-35 - very pregnant

pregSource:

accepts ID. See Pregnancy Control section for more.
Who sired her pregnancy
 0 - unknown
-1 - player
-2 - citizen of your arcology
-3 - player's former master
-4 - male arc owner
-5 - player's client
-6 - Societal Elite
-7 - designer baby
-8 - an animal
-9 - futanari sister

pregType:

Number of children. Warning! Should be not changed after initial impregnation setup. See Pregnancy Control section for more.

readyOva:

Number of ready to be impregnated ova (override normal cases), default - 0. For delayed impregnations with multiples. Used onetime on next call of the SetPregType widget. After SetPregType use it to override .pregType, it set back to 0 automatically.

fertKnown:

Menstrual cycle known variable. To be used for fertility cycle discover and things like pregnancy without a first period

0 - no
1 - yes

fertPeak:

Menstrual cycle control variable.

 0 - Danger week
1+ - safe week

ovaImplant:

Ovary implant type.

0 - no implants
"fertility" - higher chance of twins (or more)
"sympathy" - doubles eggs released
"asexual" - self-fertilizing

wombImplant:

Womb focused enhancements.
"none"
"restraint" - Provides structural support for extremely oversized pregnancies

broodmother:

has the slave been turned into a broodmother
0 - no
1 - standard 1 birth/week
2 - black market 12 births/week
3 - black market upgrade for implant firmware, to allow change weekly number of ova in range of 1 to 12 in remote surgery block. (broodmotherFetuses change through remote surgery). (future usage)

broodmotherFetuses:
count of ova that broodmother implant force to release. Should be set with "broodmother" property together. If broodmother == 0 has no meaning.

broodmotherOnHold:

If broodmother implant set to pause it's work.
1 - implant on pause
!= 1 - working.
If broodmother birth her last baby and her implant is on pause, she will be in contraception like state.

broodmotherCountDown:

Number of weeks left until last baby will be birthed. Mainly informative only. Updated automatically at birth process based on remaining fetuses.
0-37

labor:

variable used to set off the birth events
1 - birth this week
0 - not time yet

bellyAccessory:

may accept strings, use at own risk
"none"
"a small empathy belly"
"a medium empathy belly"
"a large empathy belly"
"a huge empathy belly"
"a corset"
"an extreme corset"
"a support band"

labia:

labia type
0 - minimal
1 - big
2 - huge
3 - huge dangling

clit:

clit size
0 - normal
1 - large
2 - huge
3 - enormous
4 - penis-like
5 - like a massive penis

clitSetting:

smart piercing setting
"off"
"none"
"all"
"no default setting"
"women"
"men"
"vanilla"
"oral"
"anal"
"boobs"
"submissive"
"humiliation"
"pregnancy"
"dom"
"masochist"
"sadist"

dick:

dick size
0 - none
1 - tiny
2 - little
3 - normal
4 - big
5 - huge
6 - gigantic
7  - massive/gigantic
8  - truly imposing/titanic
9  - monstrous/absurd
10 - awe-inspiring/inhuman
11+- hypertrophied

foreskin:

0  - circumcised
1+ - uncut*

*also affects foreskin size

anus:

anus size
0 - virgin
1 - tight
2 - loose
3 - very loose
4 - gaping

analArea:

used to calculate size of area around anus.
accepts int

dickPiercing:

is dick pierced
0 - no
1 - yes
2 - heavy

dickTat:

dick tattoo
takes one of the following strings or 0

"tribal patterns"
"flowers"
"scenes"
"Asian art"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"

prostate:

does the slave have a prostate?
0 - no
1 - normal
2 - hyperstimulated +20%
3 - modified hyperstimulated +50%

balls:*

ball size
0   - none
1   - vestigial
2   - small
3   - average
4   - large
5   - massive
6   - huge
7   - giant
8   - enormous
9   - monstrous
10  - inhuman
11+ - hypertrophied

scrotum:*

scrotum size
function relative to .balls

*If .balls gt 0 and .scrotum is 0, balls are internal

ovaries:

has ovaries
0 - no
1 - yes

anusTat:

anus tattoo
takes one of the following strings or 0

"bleached"
"tribal patterns"
"flowers"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"

makeup:

has makeup
0  - none
1  - minimal
2  - expensive, luxurious
3  - color-coordinated with hair
4  - heavy
5  - neon
6  - color-coordinated neon
7  - metallic
8  - color-coordinated metallic

nails:

nail type
0  - neatly clipped
1  - long and elegant
2  - color-coordinated with hair
3  - sharp and claw-like
4  - bright and glittery
5  - very long and garish
6  - neon
7  - color-coordinated neon
8  - metallic
9  - color-coordinated metallic

brand:

is an object
keys include any place on a slave body that can receive a brand, values are a string for the brand.

shouldersTat:

shoulder tattoo
takes one of the following strings or 0

"tribal patterns"
"flowers"
"scenes"
"Asian art"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"

armsTat:

arm tattoo
takes one of the following strings or 0

"tribal patterns"
"flowers"
"scenes"
"Asian art"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"

legsTat:

leg tattoo
takes one of the following strings or 0

"tribal patterns"
"flowers"
"scenes"
"Asian art"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"

backTat:

back tattoo
takes one of the following strings or 0

"tribal patterns"
"flowers"
"scenes"
"Asian art"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"

stampTat:

tramp stamp
takes one of the following strings or 0

"tribal patterns"
"flowers"
"scenes"
"Asian art"
"degradation"
"counting"
"advertisements"
"rude words"
"bovine patterns"
"sacrament"
"Sacrilege"
"Possessive"
"Paternalist"

skill:

Encapsulates all the skills
skill.vaginal:

0-10  - unskilled
11-30 -	basic
31-60 -	skilled
61-99 - expert
100+  - master

skill.oral:

0-10  - unskilled
11-30 -	basic
31-60 -	skilled
61-99 - expert
100+  - master

skill.anal:

0-10  - unskilled
11-30 -	basic
31-60 -	skilled
61-99 - expert
100+  - master

skill.whoring:

0-10  - unskilled
11-30 -	basic
31-60 -	skilled
61-99 - expert
100+  - master

skill.entertainment:

0-10  - unskilled
11-30 -	basic
31-60 -	skilled
61-99 - expert
100+  - master

skill.combat:

0 - unskilled
1 - skilled

skill.headGirl:

Her skill as a Head Girl
accepts int
default cap is 200

skill.recruiter:

Her skill as a recruiter
accepts int
default cap is 200

skill.bodyguard:

Her skill as a bodyguard
accepts int
default cap is 200

skill.madam:

Her skill as a brothel madam
accepts int
default cap is 200

skill.DJ:

Her skill as a DJ
accepts int
default cap is 200

skill.nurse:

Her skill as a nurse
accepts int
default cap is 200

skill.teacher:

Her skill as a teacher
accepts int
default cap is 200

skill.attendant:

Her skill as an attendant
accepts int
default cap is 200

skill.matron:

Her skill as a matron
accepts int
default cap is 200

skill.stewardess:

Her skill as a stewardess
accepts int
default cap is 200

skill.milkmaid:

Her skill as a milk maid
accepts int
default cap is 200

skill.farmer:

Her skill as a farmer
accepts int
default cap is 200

skill.wardeness:
Her skill as a wardeness
accepts int
default cap is 200

skill.servant:
Her skill as a servant.
accepts int
default cap is 200

skill.entertainer:
Her skill as an entertainer.
accepts int
default cap is 200

skill.whore:
Her skill as a whore.
accepts int
default cap is 200

useRulesAssistant:

follows rules or is exempt from them
0 - exempt
1 - obeys

diet:

"healthy"
"restricted"
"muscle building"
"fattening"
"slimming"
"corrective"
"XX"
"XY"
"XXY"
"cum production"
"cleansing"
"fertility"

dietCum:

how much of her diet is cum
0 - none
1 - supplemented
2 - nearly entirely

dietMilk:

how much of her diet is milk
0 - none
1 - supplemented
2 - nearly entirely

hormones:

-2 - heavy male hormones
-1 - male hormones
 0 - none
 1 - female hormones
 2 - heavy female hormones

drugs:

"no drugs"
"breast injections"
"butt injections"
"lip injections"
"fertility drugs"
"penis enhancement"
"testicle enhancement"
"psychosuppressants"
"psychostimulants"
"steroids"
"hormone enhancers"
"hormone blockers"
"super fertility drugs"
"hyper breast injections"
"hyper butt injections"
"hyper penis enhancement"
"hyper testicle enhancement"
"female hormone injections"
"male hormone injections"
"anti-aging cream"
"appetite suppressors"
"penis atrophiers"
"testicle atrophiers"
"clitoris atrophiers"
"labia atrophiers"
"nipple atrophiers"
"lip atrophiers"
"breast redistributors"
"butt redistributors"
"sag-B-gone"
"growth stimulants"
"priapism agents"

aphrodisiacs:

-1 - anaphrodisiacs
 0 - none
 1 - standard
 2 - powerful

curatives:

0 - none
1 - preventatives
2 - curatives

chem:

if greater than 10 triggers side effects from drug use.
accepts int

addict:

how addict to aphrodisiacs slave is
0   - not
1-2 - new addict
3-9 - confirmed addict
10+ - dependent

fuckdoll:

fuckdoll degree
0  - not
1+ - fuckdoll

choosesOwnClothes:

0 - no
1 - yes

clothes:

may accept strings, use at own risk
"a ball gown"
"a bimbo outfit"
"a biyelgee costume"
"a bra"
"a bunny outfit"
"a burkini"
"a burqa"
"a button-up shirt"
"a button-up shirt and panties"
"a chattel habit"
"a cheerleader outfit"
"a comfortable bodysuit"
"a courtesan dress"
"a cybersuit"
"a dirndl"
"a fallen nuns habit"
"a Fuckdoll suit"
"a gothic lolita dress"
"a halter top dress"
"a hanbok"
"a hijab and abaya"
"a hijab and blouse"
"a huipil"
"a kimono"
"a klan robe"
"a latex catsuit"
"a leotard"
"a long qipao"
"a maternity dress"
"a military uniform"
"a mini dress"
"a monokini"
"a mounty outfit"
"a nice maid outfit"
"a nice nurse outfit"
"a nice pony outfit"
"a niqab and abaya"
"a one-piece swimsuit"
"a penitent nuns habit"
"a police uniform"
"a red army uniform"
"a Santa dress"
"a scalemail bikini"
"a schoolgirl outfit"
"a schutzstaffel uniform"
"a skimpy loincloth"
"a slave gown"
"a slutty klan robe"
"a slutty maid outfit"
"a slutty nurse outfit"
"a slutty outfit"
"a slutty pony outfit"
"a slutty qipao"
"a slutty schutzstaffel uniform"
"a sports bra"
"a string bikini"
"a striped bra"
"a succubus outfit"
"a sweater"
"a sweater and cutoffs"
"a sweater and panties"
"a t-shirt"
"a t-shirt and jeans"
"a t-shirt and panties"
"a t-shirt and thong"
"a tank-top"
"a tank-top and panties"
"a thong"
"a toga"
"a tube top"
"a tube top and thong"
"an apron"
"an oversized t-shirt"
"an oversized t-shirt and boyshorts"
"attractive lingerie"
"attractive lingerie for a pregnant woman"
"battlearmor"
"Imperial Plate"
"a tight Imperial bodysuit"
"battledress"
"body oil"
"boyshorts"
"chains"
"choosing her own clothes"
"clubslut netting"
"conservative clothing"
"cutoffs"
"cutoffs and a t-shirt"
"harem gauze"
"jeans"
"kitty lingerie"
"leather pants"
"leather pants and a tube top"
"leather pants and pasties"
"lederhosen"
"nice business attire"
"no clothing"
"overalls"
"panties"
"panties and pasties"
"pasties"
"restrictive latex"
"shibari ropes"
"slutty business attire"
"slutty jewelry"
"spats and a tank top"
"sport shorts"
"sport shorts and a sports bra"
"sport shorts and a t-shirt"
"stretch pants and a crop-top"
"striped panties"
"striped underwear"
"uncomfortable straps"
"Western clothing"

collar:

may accept strings, use at own risk
"none"
"ancient Egyptian"
"cruel retirement counter"
"uncomfortable leather"
"tight steel"
"shock punishment"
"heavy gold"
"pretty jewelry"
"nice retirement counter"
"bell collar"
"leather with cowbell"
"bowtie"
"neck tie"
"neck corset"
"stylish leather"
"satin choker"
"preg biometrics"
"silk ribbon"

faceAccessory:
"none"
"porcelain mask"
"cat ears"

mouthAccessory:
"none"
"ball gag"
"bit gag"
"ring gag"
"massive dildo gag"
"dildo gag"

shoes:

may accept strings, use at own risk
"none"
"heels"
"platform heels"
"pumps"
"extreme heels"
"extreme platform heels"
"boots"
"flats"
"platform shoes"

vaginalAccessory:

may accept strings, use at own risk
"none"
"bullet vibrator"
"smart bullet vibrator"
"dildo"
"large dildo"
"huge dildo"
"long dildo"
"long, large dildo"
"long, huge dildo"

vaginalAttachment:

may accept strings, use at own risk
"none"
"vibrator"

dickAccessory:

may accept strings, use at own risk
"none"

chastityAnus:

whether the slave has a chastity device on their anus
0 - no
1 - yes

chastityPenis:

whether the slave has a chastity device on their penis
0 - no
1 - yes

chastityVagina:

whether the slave has a chastity device on their vagina
0 - no
1 - yes

armAccessory:

may accept strings, use at own risk
"none"
"hand gloves"
"elbow gloves"

legAccessory:

may accept strings, use at own risk
"none"
"short stockings"
"long stockings"

buttplug:

may accept strings, use at own risk
"none"
"plug"
"large plug"
"huge plug"
"long plug"
"long, large plug"
"long, huge plug"

buttplugAttachment:

Does the slave have an attachment on their buttplug
may accept strings, use at own risk
"none"
"tail"
"fox tail"
"cat tail"
"cow tail"

intelligence:

slave intelligence
-100 - -96  - borderline retarded
-95  - -51  - very slow
-50  - -16  - slow
-15  -  15  - average
 16  -  50  - smart
 51  -  95  - very smart
 96  -  100 - brilliant

intelligenceImplant:

Degree of slave's education
-15+ - miseducated (slave appears to be dumber than they really are)
 0   - uneducated
 1+  - partial education (not really used)
 15+ - educated
 30  - well educated

energy:

sex drive
0-20  - no sex drive
21-40 - poor sex drive
41-60 - average sex drive
61-80 - good sex drive
81-95 - powerful sex drive
96+   - nymphomaniac

need:

how badly she needs sex.
0	 - sated

partners:

A Set containing the IDs of everyone you know the slave has slept with. Only contains unique entries.

1+	- slave ID
-1	- PC
-2	- citizen of your arcology
-3	- PC's former master
-4	- fellow arcology owner
-6	- Societal Elite member
-8	- an animal
-9	- Futanari Sister

attrXX:

attraction to women
0-5   - disgusted by women
6-15  - turned off by women
15-35 - not attracted to women
36-65 - indifferent to women
66-85 - attracted to women
86-95 - aroused by women
96+   - passionate about women

attrXY:

attraction to men
0-5   - disgusted by men
6-15  - turned off by men
15-35 - not attracted to men
36-65 - indifferent to men
66-85 - attracted to men
86-95 - aroused by men
96+   - passionate about men

*if both attrXX and attrXY > 95, slave will be omnisexual*
*if energy > 95 and either attrXX or attrXY > 95, slave will be nymphomaniac

attrKnown:

0 - no
1 - yes

fetish:

"none"
"mindbroken"
"submissive"
"cumslut"
"humiliation"
"buttslut"
"boobs"
"sadist"
"masochist"
"dom"
"pregnancy"

fetishStrength:

how strong her fetish is (10-100)

10+ - enjoys fetish
60+ - likes fetish
95+ - loves fetish

fetishKnown:

is fetish known to player
0 - no
1 - yes

behavioralFlaw:

"none"
"arrogant"		- clings to her dignity, thinks slavery is beneath her
"bitchy"		- can't keep her opinions to herself
"odd"			- says and does odd things
"hates men"		- hates men
"hates women"	- hates women
"gluttonous"	- likes eating, gains weight
"anorexic"		- dislikes eating and being forced to eat, loses weight
"devout"		- resistance through religious faith
"liberated"		- believes slavery is wrong

behavioralQuirk:

"none"
"confident"		- believes she has value as a slave
"cutting"		- often has as witty or cunning remark ready, knows when to say it
"funny"			- is funny
"adores women"	- likes spending time with women
"adores men"	- likes spending time with men
"fitness"		- loves working out
"insecure"		- defines herself on the thoughts of others
"sinful"		- breaks cultural norms
"advocate"		- advocates slavery

sexualFlaw:

"none"
"hates oral"		- hates oral sex
"hates anal"		- hates anal sex
"hates penetration" - dislikes penetrative sex
"shamefast"		 - nervous when naked
"idealistic"		- believes sex should be based on love and consent
"repressed"		 - dislikes sex
"apathetic"		 - inert during sex
"crude"			 - sexually crude and has little sense of what partners find disgusting during sex
"judgemental"	   - sexually judgemental and often judges her sexual partners' performance
"neglectful"		- disregards herself in sex
"cum addict"		- addicted to cum
"anal addict"	   - addicted to anal
"attention whore"   - addicted to being the center of attention
"breast growth"	 - addicted to her own breasts
"abusive"		   - sexually abusive
"malicious"		 - loves causing pain and suffering
"self hating"	   - hates herself
"breeder"		   - addicted to being pregnant


sexualQuirk:

"none"
"gagfuck queen"	  - can take a facefucking
"painal queen"	   - knows how far she can go without getting hurt
"strugglefuck queen" - knows how much resistance her partners want
"tease"			  - is a tease
"romantic"		   - enjoys the closeness of sex
"perverted"		  - enjoys breaking sexual boundaries
"caring"			 - enjoys bring her partners to orgasm
"unflinching"		- willing to do anything
"size queen"		 - prefers big cocks

geneticQuirks:

0 - does not have
1 - carrier
2 - active
3 - inactive (used for triggering macromastia and kin to start growing)

{

macromastia - Oversized breasts. Breasts try to return to oversized state if reduced.
gigantomastia - Greatly oversized breasts. Increased growth rate, reduced shrink rate. Breasts try to return to oversized state if reduced.
macromastia + gigantomastia - Breasts never stop growing. Increased growth rate, no shrink rate.

fertility - slave is prone to having twins, shorter pregnancy recovery rate
hyperFertility - slave is prone to having multiples, even shorter pregnancy recovery rate
fertility + hyperFertility - slave will have multiples, even shorter pregnancy recovery rate

superfetation - pregnancy does not block ovulation, slave can become pregnant even while pregnant

polyhydramnios - fetal overproduction of amniotic fluid

uterineHypersensitivity - Hyper sensitive uterus + pleasurable birth

galactorrhea - inappropriate lactation

gigantism - slave is abnormally tall
dwarfism - slave is abnormally short
gigantism + dwarfism - slave is very average

neoteny - retains childlike characteristics
progeria - rapid aging
neoteny + progeria = progeria

pFace - slave has a flawless face
uFace - slave has a hideous face
pFace + uFace - Depends on carrier status, may swing between average and above/below depending on it

albinism - slave has pale skin, white hair and red eyes

heterochromia - slave may have mismatched eye colors (Takes a string if not zero!)

rearLipedema - slave's ass never stops growing. Increased growth rate, reduced shrink rate.

wellHung - slave has (or will have) a huge dong

wGain - slave constantly gains weight unless dieting, easier to gain weight
wLoss - slave constantly loses weight unless gaining, easier to lose weight
wGain + wLoss - slave weight gain/loss fluctuates randomly


mGain - slave constantly gains muscle mass, easier to gain muscle.
mLoss - slave constantly loses muscle mass, easier to lose muscle.
mGain + mLoss - slave muscle gain/loss amplified, passively lose muscle unless building

androgyny - slave's body attempts to normalize to an androgynous state

}

counter:

Tracks slave participation in various actions and their outcomes

counter.milk:

amount of milk given
accepts int

counter.cum:

amount of cum given
accepts int

counter.births:

number of births as your slave
accepts int

counter.birthsTotal:

How many known times the slave has given birth.
accepts int

counter.abortions:

number of abortions as your slave
accepts int

counter.miscarriages:

number of miscarriage as your slave
accepts int

counter.oral:

oral sex count
accepts int

counter.vaginal:

vaginal sex count
accepts int

counter.anal:

anal sex count
accepts int

counter.mammary:

breast sex count
accepts int

counter.penetrative:

penetrative sex count
accepts int

counter.publicUse:

How many times the slave has had public sex in your arcology. Used to determine if she is your private toy or a lusted after slut.
accepts int

counter.pitKills:

number of slaves killed in pit fights
accepts int

counter.pitWins:

number of pit fights won
accepts int

counter.pitLosses:

number of pit fights lost
accepts int

counter.slavesFathered:

How many slaves she has sired under your ownership.

counter.PCChildrenFathered:

How many children she has fucked into you that you later birthed.

counter.slavesKnockedUp:

How many of your slaves she has knocked up.

counter.PCKnockedUp:

How many times she has knocked you up.

custom:

Encapsulates various custom properties, set by users

custom.tattoo:

adds a custom tattoo
accepts string

custom.label:

seems to just be a label appended after the slave's name
accepts string

custom.desc:

adds a custom description
accepts string

custom.title:

What the slave refers to you as.
accepts string
default ""

custom.titleLisp:

What the slave refers to you as, with a lisp.
accepts string
default ""

rudeTitle:

Does this slave refer to you rudely?
0 - not being rude
1 - insists on calling you a rude title

custom.image:

Custom slave image or null
default is null (no custom image)

custom.image.filename

holds the custom slave image file name (used if images are enabled)
accepts string

custom.image.format:

holds the custom slave image file format.
one of "png", "jpg", "gif" or "webm"
default "png"

custom.hairVector:

holds the custom hair vector base file name (used if vector images are enabled)
accepts string
default 0 (use hardcoded hair styles)

currentRules: []

array that holds active rules for the slave
wouldn't mess with it

piercing:

encapsulates piercings
piercing.ear
piercing.nose
piercing.eyebrow
piercing.lips
piercing.tongue
piercing.nipple
piercing.areola
piercing.navel
piercing.corset
piercing.vagina
piercing.dick
piercing.anus
piercing.genitals

piercing.X.weight:

How heavily X is pierced.
0 - none
1 - light
2 - heavy

piercing.X.desc:

Contains a custom description.
"" by default

piercing.genitals.smart:

Smart piercing presence.
"false"
"true"

bellyTat:

Slave has a tattoo that is only recognizable when she has a big belly.
"a heart"
"a star"
"a butterfly"

abortionTat:

Slave has a series of tattoos to denote how many abortions she has had.
-1: no tattoo
 0: assigned to have tattoo, may not have one yet
1+: number of abortion tattoos she has

birthsTat:

Slave has a series of tattoos to denote how many times she has given birth.
-1: no tattoo
 0: assigned to have tattoo, may not have one yet
1+: number of birth tattoos she has

bellySag:

How saggy her belly is after being distended for too long.
1+ changes belly description

bellySagPreg:

How saggy her belly is from being too pregnant.
1+ changes belly description and overrides/coincides with bellySag

induce:

Slave will give birth this week.
1 - true
0 - false

mpreg:

Male slave has an anal womb and can get pregnant.
1 - true
0 - false

inflation:

How much fluid is distending the slave.
1 - 2L
2 - 4L
3 - 8L

inflationType:

What kind of fluid is in the slave.
accepts string
"none"
"water"
"cum"
"milk"
"food"
"aphrodisiac"
"curative"
"tightener"
"urine"

inflationMethod:

How she is being filled.
0 - not
1 - oral
2 - anal
3 - orally by another slave

milkSource:

If inflationMethod 3, ID of the slave filling her with milk.
accepts ID

cumSource:

If inflationMethod 3, ID of the slave filling her with cum.
accepts ID

burst:

Slave's internals have ruptured. Used with poor health and over inflation.
1 - true
0 - false

pregKnown:

Do you and the slave know she is pregnant.
0 - no
1 - yes

pregWeek:

How long she has been pregnant (used in place of .preg when pregnancy speed up and slow down are used on a slave) (if negative, designates postpartum.)
accepts int

belly:

how big their belly is in CCs
thresholds
100	- bloated
1500   - early pregnancy
5000   - obviously pregnant
10000  - very pregnant
15000  - full term
30000  - full term twins
45000  - full term triplets
60000  - full term quads
75000  - full term quints
90000  - full term sextuplets
105000 - full term septuplets
120000 - full term octuplets
150000 - oversized pregnancy
300000 - hyperpreg state 1
450000 - hyperpreg state 2
600000 - hyperpreg state 3
750000 - hyperpreg state 4

bellyPreg:

how big their belly is in CCs (pregnancy only)
thresholds
100	- bloated
1500   - early pregnancy
5000   - obviously pregnant
10000  - very pregnant
15000  - full term
30000  - full term twins
45000  - full term triplets
60000  - full term quads
75000  - full term quints
90000  - full term sextuplets
105000 - full term septuplets
120000 - full term octuplets
150000 - oversized pregnancy (9+ babies)
300000 - hyperpreg state 1 (20+ babies)
450000 - hyperpreg state 2 (30+ babies)
600000 - hyperpreg state 3 (40+ babies)
750000 - hyperpreg state 4 (50+ babies)

bellyFluid: 0

how big their belly is in CCs (fluid distension only)
thresholds
100	- bloated
2000   - clearly bloated (2L)
5000   - very full (~1gal)
10000  - full to bursting (~2gal)

bellyImplant:

Does the slave have a fillable abdominal implant.
-1	   - no
0+	   - yes
2000+	- Early pregnancy
4000+	- looks pregnant
8000+	- looks full term
16000+   - hyperpregnant 1
32000+   - hyperpregnant 2

bellyPain:

Has the slave's belly implant been filled this week. Causes health damage for overfilling.
0 - no pain
1 - will experience pain
2 - cannot be filled this week

cervixImplant:

Does the slave have a cervical implant that slowly feeds cum from being fucked into a fillable implant.
0 - no
1 - vaginal version only
2 - anal version only
3 - both vaginal and anal

counter.birthsTotal:

How many known times the slave has given birth.
accepts int

pubertyAgeXX:

Target .physicalAge for female puberty to occur.
accepts int

pubertyXX:

Has the slave gone through female puberty.
0 - no
1 - yes

pubertyAgeXY:

Target .physicalAge for male puberty to occur.
accepts int

pubertyXY:

Has the slave gone through male puberty.
0 - no
1 - yes

scar:

is an object
keys include any place on a slave body that can receive a scar, values are an object. This sub-object's keys are the kind of scar, and the property is an int showing how bad it is.

breedingMark:

In a eugenics society, this slave is a designated breeder.
1 - yes
0 - no

underArmHColor:

color of armpit hair
accepts string

underArmHStyle:

armpit hair style
accepts string
"hairless"
"waxed"
"shaved"
"neat"
"bushy"
"bald"

eyebrowHColor:

color of eyebrows
accepts string

eyebrowHStyle:

eyebrow hair style
accepts string

"bald"
"shaved"
"straight"
"rounded"
"natural"
"slanted inwards"
"slanted outwards"
"high-arched"
"elongated"
"shortened"
"curved"

eyebrowFullness:

eyebrow thickness
accepts string

"pencil-thin"
"thin"
"threaded"
"natural"
"tapered"
"thick"
"bushy"

bodySwap:

Slave is in original body.
0 - yes
1+ number of swaps (increases upkeep each time)

mother:

Slave's mother's ID
Accepts ID
Values between 0 and -20 are reserved.
 0 - unknown
-1 - player
-2 - citizen of your arcology
-3 - player's former master
-4 - male arc owner
-5 - player's client
-6 - Societal Elite
-7 - designer baby
-9 - Futanari Sister

father:

Slave's father's ID
Accepts ID
Values between 0 and -20 are reserved.
 0 - unknown
-1 - player
-2 - citizen of your arcology
-3 - player's former master
-4 - male arc owner
-5 - player's client
-6 - Societal Elite
-7 - designer baby
-9 - Futanari Sister

sisters:

How many sisters the slave has, do not tamper with.

daughters:

How many daughters the slave has, do not tamper with.

canRecruit:

Can the slave recruit. Non-random slaves should be left off.
0 - no
1 - yes

PCExclude:

Is the PC permitted to fuck this slave pregnant.
0 - no
1 - yes

HGExclude:

Is the Head Girl permitted to fuck this slave pregnant.
0 - no
1 - yes

StudExclude:

Is the Stud permitted to fuck this slave pregnant.
0 - no
1 - yes

ballType:

What species of sperm she produces.
"human"
"sterile"
"dog"
"pig"
"horse"
"cow"

eggType:

What species of ovum she produces.
"human"
"dog"
"pig"
"horse"
"cow"

reservedChildren:

How many of her children are tagged to be incubated. Carefully balanced, do not manually touch.
! Secondary|legacy. Can be used for caching only, use JS:
  WombSetGenericReserve(slave, "incubator", reservedChildren) to setup primary data. Not add count, but set it to reservedChildren
  WombCleanGenericReserve(slave, "incubator", reservedChildren) to remove reserve. To clean all incubator reserve use 9999 for reservedChildren.

reservedChildrenNursery:

How many of her children are tagged to be put in the Nursery. Highly likely to break.
! Secondary|legacy. Can be used for caching only, use JS:
  WombSetGenericReserve(slave, "nursery", reservedChildren) to setup primary data. Not add count, but set it to reservedChildren
  WombCleanGenericReserve(slave, "nursery", reservedChildren) to remove reserve. To clean all nursery reserve use 9999 for reservedChildren.


  Reserve type ("incubator", "nursery", etc) do not affect each other types, and can be safely used without any checks.
  Also if you try to reserve more then available and not already reserved fetuses in slave womb, will be reserved only actually existing free fetuses. If you try to clean reserve more then present - will be cleaned only actually existing reserve.
  These reserve functions always use first available fetus(es) - this will be most ready to birth fetuses (older).

  WombCleanAllReserve(slave) - will clean all reserves for slave (any type).
  x = WombReserveCount(slave, reserveType) - x will be set to count of fetuses that have reserveType. (reserveType is "incubator", "nursery", etc.)
  x = FetusGlobalReserveCount(reserveType) - x will be set to global count of reserved fetuses of reserveType. Also count PC.womb fetuses.


choosesOwnChastity:

Eugenics variable. Is the slave allowed to choose to wear chastity.
0 - no
1 - yes

pregControl:

Is she on gestation altering drugs?
"none"
"slow gestation"
"speed up"
"labor suppressors"

readyLimbs:

Array that holds an amputee's constructed limbs for anon's hotswap mod. Elements of the array should be objects.
.type - type of prosthetic limb, ranges from -1 to -5, see .amp for more information
.armsTat - any string, see .armsTat for standard strings
.legsTat - any string, see .legsTat for standard strings

bald:

Slave has undergone hair removal surgery
0 - no
1 - yes

origBodyOwner:

accepts string
Who, if relevant, the body belonged to.

origBodyOwnerID:

ID, if present, of the slave that possesses their old body.

death:

Cause of slave death.

hormoneBalance:

Slave's current hormonal balance, directs saHormones changes
-500 - -400 - overwhelmingly masculine
-399 - -300 - extremely masculine
-299 - -200 - heavily masculine
-199 - -100 - very masculine
-99  - -21  - masculine
-20  -  20  - neutral
 21  -  99  - feminine
 100 -  199 - very feminine
 200 -  299 - heavily feminine
 300 -  399 - extremely feminine
 400 -  500 - overwhelmingly feminine

onDiet:

Whether a slave is permitted to eat Hedonistic Decadence's specialized slave food.
0 - no
1 - yes

breastMesh:

Does the slave have the breast shape maintaining mesh implant.
0 - no
1 - yes

prematureBirth:

Used to denote a slave giving birth prematurely.
0 - no
1 - yes

premature:

Was the slave born prematurely?
0 - no
1 - yes

vasectomy:

Has the slave had a vasectomy?
0 - no
1 - yes

haircuts:

Is the slave's hair under constant maintenance?
0 - no
1 - yes

newGamePlus:

Used to tell if the slave is from this game or a previous.
0 - no
1 - yes

tankBaby:

Whether she was put in the incubator at birth
accepts int
0 - no
1 - yes, comforting
2 - yes, terrifying
3 - yes, vegetable (do not use outside of incubator!)

clone:

Is she a clone?
0 - yes
1 - no

cloneID:

If she is a clone, the ID of her source

geneMods:

	NCS:
		Does slave have induced NCS?
		0 - no
		1 - yes
	rapidCellGrowth:
		Has the slave undergone the elasticity (plasticity) treatment?
		0 - no
		1 - yes
	immortality:
		Has the slave undergone treatment to block aging?
		0 - no
		1 - yes

weightDirection:

erratic weight gain, used by (.geneticQuirks.wGain == 2 && .geneticQuirks.wLoss == 2)
 0 - stable
 1 - gaining weight
-1 - losing weight

slaveCost:

Amount of cash paid to acquire the slave
accepts negative numbers, 0, or 1.
1 - unknown price
0 - free
negative - amount paid

lifetimeCashExpenses:

Amount of cash you have spent because of this slave
accepts negative numbers or 0

lifetimeCashIncome:

Total amount of cash you have earned because of this slave
accepts positive numbers or 0

lastWeeksCashIncome:

Amount of cash you have earned because of this slave last week
accepts positive numbers or 0

lifetimeRepExpenses:
lifetimeRepIncome:
lastWeeksRepIncome:
Not currently used, will work similarly to the cash variables above

How to set up your own hero slave.

-The default slave template used is defined in src/js/SlaveState.js

Making your slave; add their name to the following, then go down the documentation adding in your changes.
-each variable must be separated from the last by a comma
-if your slave's variable matches the default, you do not have to list it
-strings MUST be in " or your slave will not compile properly

Once finished, add it into "src/npc/databases/customSlavesDatabase.js".
To test if your slave is functioning, start up a normal game, swap to cheat mode, max your rep, and view other slaveowner's stock in the slave market. If you cannot find your slave in the list, and you didn't start the game with your slave, you should double check your slave for errors. If a slave named "Blank" is present, then you likely messed up. Once you find your slave, check their description to make sure it is correct. If it is not, you messed up somewhere in setting them up.


@@.green;				- something good or health/attraction gain
@@.red;					- something bad or health/attraction loss or flaw/mindbreak acquisition
@@.hotpink;				- devotion gain
@@.mediumorchid;		- devotion loss
@@.mediumaquamarine;	- trust gain with higher devotion
@@.orangered;			- trust gain with lower devotion
@@.gold;				- trust loss
@@.coral;				- notable change and fetish loss
@@.lightcoral;			- fetish strength gain, fetish acquisition and fetish discovery
@@.lime;				- growth/improvement to a body part (reversed in some cases)
@@.orange;				- shrinking/degradation of a body part (reversed in some cases)
@@.lightsalmon;			- rivalry
@@.lightgreen;			- relationship
@@.violet;				- libido gain
@@.khaki;				- libido loss


wombJS.tw subsystem:

This is a womb processor/simulator script. It takes care of calculation of belly sizes based on individual fetus sizes, with full support of broodmothers implant random turning on and off possibility. Also this can be expanded to store more parents data in each individual fetus in future.
Should be initialized for all slaves not female only. Currently it's not affect pregnancy mechanic in game directly - it's addon for better sizes calculation, and optional mechanics for future usage.
Design limitations:
- Mother can't gestate children with different speeds at same time. All speed changes apply to all fetuses.
- Sizes of individual fetuses updated only on call of WombGetVolume - not every time as called WombProgress. This is for better overall code speed.
- For broodmothers we need actual "new ova release" code now. But it's possible to control how many children will be added each time, and so - how much children is ready to birth each time.


For new generated slaves automatically called WombInit function to do initial setup. But it's can be called at any time "just in case", if code need to be completely sure that womb exists and correctly initialized. If .preg and pregType is set above 0 at time of call with empty womb array - fetuses will be generated too.


Pregnancy control, best practices ($activeSlave used as sample, can be any slave related variable or $PC for player character):

Impregnation:

<<set WombImpregnate($activeSlave, 3, -1, 15)>>
$activeSlave, 3 fetuses, -1 - player is father, 15 week is initial time for fetuses. Can be used on already pregnant slaves (broodmothers use it).
<<SetSlaveBelly $activeSlave>>
Last line needed only if you need to show description with changed state immediately, an advanced initial pregnancy time set (showing already).

Advancing pregnancy:

<<set WombProgress($activeSlave, 1)>>
Advancing 1 week. Normally it's called by End Week processing for all slaves. Old method with using .preg++ on slave supported too, but better to use this new.

Birth checking:

<<if WombBirthReady($activeSlave, 40) > 0>>
Check if we have any babies in womb with is at minimum 40 week of gestation age? Age can be any.

Birthing:

<<set _babies = WombBirth($activeSlave, 34)>>
In array _babies will be placed all babies from womb of $activeSlave who gestation age at least 34 weeks (can be any). Others will be leaved in womb.
Optionally:
<<set WombFlush($activeSlave)>>
Will empty womb. You also still should set .preg .pregType .pregSource .pregWeek to 0, or call WombNormalizePreg.
_babies here become normal array - we can do with it as with any other array in SugarCube. _babies.length - size, _babies[0] - first element, etc. Contains all babies object, with their age, sex, volume/size, and father ID. Right now - not used anywhere but useful for possible incubator improvements in future at least.

Usage reference without SugarCube code (samples):

WombInit($slave) - before first pregnancy, at slave creation, of as backward compatibility update. Can generate proper pregnancy based on preg, pregType, and pregSource properties too. Can be little glitchy with broodmothers in this case, if their preg != pregType (or pregType can't be divided by preg with integer result).

WombImpregnate($Slave, $fetus_count, $fatherID, $initial_age) - should be added after normal impregnation code, with already calculated fetus count. ID of father - can be used in future for processing children from different fathers in one pregnancy. Initial age normally 1 (as .preg normally set to 1), but can be raised if needed. Also should be called at time as broodmother implant add another fetus(es), or if new fetuses added from other sources in future (transplanting maybe?)

WombProgress($slave, $time_to_add_to_fetuses) - after code that update $slave.preg, time to add should be the same.

$isReady = WombBirthReady($slave, $birth_ready_age) - how many children ready to be birthed if their time to be ready is $birth_ready_age (40 is for normal length pregnancy). Return int - count of ready to birth children, or 0 if no ready exists.

$children = WombBirth($slave, $birth_ready_age) - for actual birth. Return array with fetuses objects that birthed (can be used in future) and remove them from womb array of $slave. Should be called at actual birth code in SugarCube. fetuses that not ready remained in womb (array).

WombFlush($slave) - clean womb (array). Can be used at broodmother birthstorm or abortion situations in game. But birthstorm logically should use WombBirth($slave, 35) or so before - some children in this event is live capable, others is not.

$slave.bellyPreg = WombGetVolume($slave) - return double, with current womb volume in CC - for updating $slave.bellyPreg, or if need to update individual fetuses sizes.

_time = WombMinPreg($activeSlave) - age of most young fetus in womb.

_time = WombMaxPreg($activeSlave) - age of most old fetus in womb.

WombUpdatePregVars($activeSlave) - automatically update $activeSlave.preg, $activeSlave.pregType, $activeSlave.bellyPreg to actual values based on womb fetuses.

WombNormalizePreg($activeSlave) - automatically correct all pregnancy related properties of given $activeSlave. Also it advances pregnancy if detected old .preg++ method used on slave and womb simulation is late. Can be called at any time without conditions checks - function do all needed checks by itself. Call of this function do NOT advance pregnancy by itself.

WombZeroID($activeSlave, _SlaveID) - automatically scan all fetuses and if their father ID matched - it will be replaced with zero. After it actor pregnancy related variables (like .pregSource) will be updated. Used mainly in process of removing slaves from game, to clean father's ID of unborn children of remaining slaves.

All this womb system can be much more automated (.preg .pregType .pregSource .pregWeek may have to be done in a way, that they will have no need to be controlled manually anywhere at all. Just will be set fully automatically). But in this case many changes in present game code needed, to REMOVE legacy code.
Right now they are set correctly, based on state of .womb object through pregnancy, but not outside. Also old style pregnancy initiation (setting only .preg to >0 and .pregType to >=1 ) working too - WombImpregnation function for proper setup of .womb will be called on next SetBellySize call. Also old style pregnancy progression through using .preg++ is supported too, but can have minor issues with character descriptions in some cases, if SetBellySize widget not called before descriptions widgets.


Advanced pregnancy control structure:

Now, with support of human-animal pregnancy, there is need for ability to change values that been constant before. New structure designed for it.

.pregData property for slave should now contain object with describable pregnancy process. By default it will be set to human data. Templates stored in setup.pregData.x where "x" - name of species.

<<set slave.pregData = setup.pregData.human>>

In code at any time properties that contain data can be accessed now. Properties is RW, so slaves can be changed individually later. Example:

<<if slave.pregData.type == "human">>
or
<<set slave.pregData.normalOvaMin = 2, slave.pregData.normalOvaMax = 4>> (setting normal ova count 2-4 on every ovulation).

	Property list:

	type			- name of species. Should math slave.ovaType
	normalOvaMin	- normal/base ova count on ovulation (minimal)
	normalOvaMax	- normal/base ova count on ovulation (maximal)
	normalBirth		- typical normal pregnancy length in weeks
	minLiveBirth	- typical weeks that guarantee at least 90% chance to fetus survival if normal birth occur.
	fetusWeek		- array with weeks control points.
	fetusSize		- array with size control points.
	fetusCTR		- array with CTR control points.

	These three array is linked, and values in second and third should be in the same order as in first. (Week of .fetusWeek[i] is correspond to .fetusSize[i] and fetusCTR[i])
	Control points - it's points of graph as if it built on paper (one axis - fetusWeek, other - fetusSize/fetusCTR). This graph data is used to get actual size of fetus, so no need for manual setting of every week data in array.

	What is CTR? In most medical data, human fetus size (length) measured as "crown to rump" from 1 to 20 weeks, and "crown to heel" later. Formula that calculate volume of womb should get data in single format. So there is need CTR rate - value that describe difference between full "crown to heel" and "crown to rump" length of fetus (also it's can be used to control approximation of legs, hands and tails volume). For most animal fetus data it's always 1 as they are not bipedal and "crown to rump" is natural measurements for them. But CTR rate changes might be needed to get more accurate results for volume calculations, as fetus is not sphere and length - not always have the same relation to it's volume.
