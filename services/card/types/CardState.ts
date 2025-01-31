export type CardType = 'Monster' | 'Spell' | 'Trap';
export type CardSubtype = 'Normal' | 'Effect' | 'Ritual' | 'Fusion' | 'Synchro' | 'Xyz' | 'Link' | 'Token';
export type CardAttribute = 'LIGHT' | 'DARK' | 'WATER' | 'FIRE' | 'EARTH' | 'WIND' | 'DIVINE';
export type CardRace = 'dragon' | 'spellcaster' | 'zombie' | 'warrior' | 'beast-warrior' | 'beast' | 'winged beast' | 'fiend' | 'fairy' | 'insect' | 'dinosaur' | 'reptile' | 'fish' | 'sea serpent' | 'aqua' | 'pyro' | 'thunder' | 'rock' | 'plant' | 'machine' | 'psychic' | 'divine-beast' | 'cyberse' | 'wyrm';

export interface CardImage {
  file: File | null;
  generation: string | null;
}

export interface LinkMarker {
  val: boolean;
  symbol: string;
}

export interface CardState {
  // Language and UI Data
  uiLang: string;
  cardLang: string;
  cardMeta: Record<string, any>;

  // Card Basic Info
  holo: boolean;
  cardRare: string;
  titleColor: string;
  cardLoadYgoProEnabled: boolean;
  cardKey: string;
  cardTitle: string;
  cardImg: CardImage;

  // Card Type Info
  cardType: CardType;
  cardSubtype: CardSubtype;
  cardEff1: string;
  cardEff2: string;

  // Monster Specific
  cardAttr?: CardAttribute;
  cardCustomRaceEnabled: boolean;
  cardCustomRace: string;
  cardRace?: CardRace;
  Pendulum: boolean;
  Special: boolean;
  cardLevel?: string;
  cardBLUE?: number;
  cardRED?: number;
  cardATK?: string;
  cardDEF?: string;

  // Link Markers
  links: Record<string, LinkMarker>;

  // Text Info
  infoSize: string;
  cardInfo: string;
  pendulumSize: number;
  cardPendulumInfo: string;
}
