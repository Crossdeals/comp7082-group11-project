# ===== Scraper Documentation =====
This documentation will explain how the scrapers work and how they are to be called from a backend.

---

## ===== Scrapers General Explanation =====
### What they do
These scrapers will access video game webstores such as Steam, Epic Games, Xbox, and more. They will automatically search their respective webstore for a game title provided to their functions.

### How to do it
Simply call the appropriate function for the game store you're looking to get data from, passing in a game title (or SteamID for Steam). Make sure to use await as they are all asynchronous functions. The return type for all of the scrapers is an array of objects that will contain all of the information that could be gathered from that webstore.

---

## ===== Specific Scrapers Info =====
### Steam
The Steam web scraper will require the SteamID for the game we are looking for. It also can only handle one at a time, as the limited time I had to work on it meant I couldn't configure it to work with multiple SteamIDs at once.

### Epic
The Epic Games web scraper will use one or more game title, which will have to be exact, as otherwise it won't load the correct page and return no information. Allows for either just one game title or multiple, and returns the data on all game titles it was able to load.

### Xbox
The Xbox web scraper will use one or more game title, search for the title(s) provided, and gather information on every variation of the game title(s) that the Xbox webstore returns. Allows for either just one game title or multiple, and returns the data on all variations of all game titles it was provided.

### PlayStation
The PlayStation web scraper will use one or more game title, search for the title(s) provided, and gather information on every variation of the game title(s) that the PlayStation webstore returns to the first page. Allows for either just on game title or multiple, and returns the data on all variations of all game titles it was provided.

### Nintendo
The Nintendo web scraper will use one or more game title, search for the title(s) provided, and gather information on every variation of the game title(s) that the Nintendo webstore returns. Allows for either just one game title or multiple, and returns the data on all variations of all game titles it was provided.

---

## ===== How to use the functions =====
### Steam
Call GetSteam(), passing in one SteamID for whatever game you are looking for. The return will be the current price of the game.

### Epic
Call GetEpic(), passing in a string or array of strings of game titles. The return will be an array of objects containing the `title`, `original price`, `discounted price` (if applicable), `discount percent` (if applicable), and `end date`.

### Xbox
Call GetXbox(), passing in a string or array of strings of game titles. The return will be an array of objects containing the `title`, `original price`, `discounted price` (if applicable), and `discount percent` (if applicable).

### PlayStation
Call GetPlayStation(), passing in a string or array of strings of game titles. The return will be an array of objects containing the `title`, `original price`, `discounted price` (if applicable), `discount percent` (if applicable), and `end date`.

### Nintendo
Call GetNintendo(), passing in a string or array of strings of game titles. The return will be an array of objects containing the `title`, `original price`, `discounted price` (if applicable), `discount percent` (if applicable), and `end date`.

### For All
All of the scrapers will return null or empty strings where they could not find what it was looking for. Each scraper also takes a while to return, since they need to actually go to each site and pretend to be a person in order to get the data.