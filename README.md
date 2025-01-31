# 遊戲王卡製造機 | yugioh-card-maker

## DEMO頁面

https://yugioh-card.linziyou.info/

## 專案說明

- 這是一個NuxtJS為框架的靜態網站
- 使用JavaScript及Canvas進行卡片程式邏輯實作

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env`
- Set up a Supabase project at https://supabase.com
- Create a storage bucket named 'card-images' with the following settings:
  1. Enable public bucket access
  2. Enable Row Level Security (RLS)
  3. Add the following storage policies in the Supabase dashboard:
  ```sql
  -- Allow public read access to all files
  CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'card-images');

  -- Allow public uploads
  CREATE POLICY "Allow Uploads"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'card-images');
  ```
- Add your Supabase URL and anon key to `.env`:
```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```
- If using DALL-E image generation, add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_key
```

3. Run development server:
```bash
npm run dev
```

## 功能

- 使用者可以製作個人化的遊戲王卡
- 支援正體中文、日文（漢字的假名部分不支援）、英文
- 2019/09以前的卡片支援以密碼輸入的方式取得卡片資訊
- 支援圖片上傳與儲存 (使用Supabase Storage)
- 支援使用DALL-E生成卡片圖片

## 多國語系說明 About Multilingual

### User Interface Language

- The language of "User Interface" file is located at /static/lang.ui.json.
- Anyone who wants to add other ui languages just need to modify the json file.

### Card Language

- The language of "Card" file is located at /static/lang.card_meta.json.
- The language uses Chinese, Japanese and English as the base template for the card due to the fonts and card template design.
- You can just copy and paste the exists language data and modify the necessary part
- The description of the json is as follows:

```javascript
{
    "en": {     // langage key; If the key is in the ui language, it will automatically switch when the ui language changes
        "name": "English",              // language name
        "SEP": "     ",                 // separator
        "QUOTE_L": "[",                 // left quotation mark
        "QUOTE_R": "]",                 // right quotation mark
        "M_SPECIAL": "/Special Summon", // special summon monster text with slash
        "M_EFFECT": "/Effect",          // effect monster text with slash
        "M_PENDULUM": "/Pendulum",      // pendulum monster text with slash
        "Subtype": {                    // subtypes text with slash
            "Fusion": "/Fusion", 
            "Ritual": "/Ritual", 
            ...
        },
        "Effect": {                     // effects text with slash and the effect 'none' and 'normal' should be empty string
            "none": "",
            "normal": "",
            "toon": "/Toon",
            "spirit": "/Spirit",
            ...
        },
        "Race": {                       // race types text
            "fiend": "Fiend",
            "zombie": "Zombie",
            "sea_serpent": "Sea Serpent",
            ...
        },
        "Spell": "Spell Card",          // spell card text
        "Trap": "Trap Card",            // trap card text
        
        "Default": {                    // default card data; use 'Odd-Eyes Revolution Drago' as a sample
            "title": "Odd-Eyes Revolution Dragon",
            "info": "Cannot be Normal Summoned/Set. Must be either Pendulum Summoned from the hand, or Special Summoned (from your hand) by Tributing 3 Dragon monsters (1 Fusion, 1 Synchro, and 1 Xyz). You can discard this card and pay 500 LP; add 1 Level 8 or lower Dragon Pendulum Monster from your Deck to your hand. Gains ATK/DEF equal to half your opponent's LP. Once per turn: You can pay half your LP; shuffle all other cards on the field and in the GYs into the Deck.",
            "pInfo": "You cannot Pendulum Summon monsters, except Dragon monsters. This effect cannot be negated. You can target 1 Dragon Fusion, Synchro, or Xyz Monster in your GY; destroy this card, and if you do, Special Summon that monster.",
            "size": 20, "pSize": 22
        },

        // NOTICE:
        // This section will affect the graphics and fonts on the card
        // Generally speaking, if it is a Latin family language, copy a 'en' language
        // data and change the upper part, this section does not need to be changed
        // The Latin family has the same data as 'en' language
        "_templateLang": "en",                           // Language of the card base template
        "_fontName": ["en","en2","en3","zh","cn","en"],  // Font of card
        "_offset": {                                     // Drawing offset of text and image
            "tS": 10, "sS": 5,
            "tX": 0, "tY": -6, 
            "sX1": -17, "sX2": 3, "sY1": 0, "sY2": 0,
            "oX": 15, "oY": -3, "lh": 7
        }
    }
}
```

## Badge

![GitHub last commit](https://img.shields.io/github/last-commit/linziyou0601/yugioh-card-maker?style=for-the-badge) ![](https://img.shields.io/badge/author-linziyou0601-red.svg?style=for-the-badge) ![](https://img.shields.io/badge/language-vue-blue.svg?style=for-the-badge)
