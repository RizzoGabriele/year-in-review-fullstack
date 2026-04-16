
# Year in Review

## React Client Application Routes

- Route `/`: 
  - Content: Home page with a list of public recaps
  - Purpose: The app’s landing page (accessible without login). It allows users to open a public slideshow and, if authenticated, access creation features and their profile
- Route `/login`:
  - Content: Login form (username/email + password)
  - Purpose: User authentication using session cookies (Passport.js).
- Route `/recaps/:recapId` :
  - Content: Slideshow viewer of the selected recap
  - Purpose: Displays the recap pages (image + overlay texts). Access is allowed if the recap is public or if the authenticated user is the author.
  - Param: recapId = integer, recap ID.
- Route `/create` :
  - Content: Creation source selection (template or clone from public recap)
  - Purpose: Allows authenticated users to create a new recap starting from:
    - a template (available themes: Travel or Gin)
    - an existing public recap (keeping the same theme and tracking its origin author).
- Route `/editor/:recapId` :
  - Content: Recap editor (title, pages, texts, visibility)
  - Purpose: Full recap editing: change images (only within the same theme), edit text slots, add/remove pages (minimum 3), and set visibility (public/private).
  - Param: recapId = integer, recap ID.
- Route `/profile` :
  - Content: Personal area with user’s recaps (including private ones)
  - Purpose: Displays and manages the user’s private recaps (owner only).
- Route `*` :
  - Content: Not found page
  - Purpose: Catch-all route for undefined paths.

## API Server

- POST `/api/sessions`
  - Parameters / body: username, password
  - Response: authenticated user object (id, username, name)
  - Purpose: user authentication via Passport.js and session cookies.
  ```
  {
  "idUser": 1,
  "username": "user1",
  "name": "Mario Rossi"
  }
  ```
- GET `/api/sessions/current`
  - Parameters: none
  - Response: authenticated user object
  - Purpose: verifies the active session and retrieves the current user.
  ```
  {
    "idUser": 1,
    "username": "user1",
    "name": "Mario Rossi"
  }
  ```
- DELETE `/api/sessions/current`
  - Parameters: none
  - Response: empty object
  - Purpose: logs out the user and destroys the session.
```
  {
    "idUser": 1,
    "username": "user1",
    "name": "Mario Rossi"
  }
  ```
- GET `/api/recaps/public`
  - Parameters: none
  - Response: list of public recaps (id, title, theme, author), including origin data if the recap was derived from another one
  - Purpose: displays public recaps on the home page, accessible without authentication.
  ```
  {
    "id": 1,
    "title": "My year on the road 2025",
    "theme": "Viaggi",
    "author": "Mario Rossi",
    "derivedFromRecapId": null,
    "derivedFromTitle": null,
    "derivedFromAuthor": null
  },
  {
    "id": 3,
    "title": "Best Gin Bottles of 2025",
    "theme": "Gin",
    "author": "Mario Rossi",
    "derivedFromRecapId": null,
    "derivedFromTitle": null,
    "derivedFromAuthor": null
  },
  {
    "id": 4,
    "title": "Travel Work of 2025",
    "theme": "Viaggi",
    "author": "Guido Bianchi",
    "derivedFromRecapId": null,
    "derivedFromTitle": null,
    "derivedFromAuthor": null
  },
  {
    "id": 6,
    "title": "Travel in Europe 2025",
    "theme": "Viaggi",
    "author": "Anna Russi",
    "derivedFromRecapId": null,
    "derivedFromTitle": null,
    "derivedFromAuthor": null
  },
  ```
- GET `/api/recaps/:recapId`
  - Parameters: recapId (integer)
  - Response: full recap in slideshow format (pages, images, texts)
  - Purpose: displays a public recap or a private recap of the authenticated user.
  ```
  {
  "id": 1,
  "title": "Il mio anno in Viaggio - 2025",
  "visibility": "public",
  "author": "Mario Rossi",
  "themeId": 1,
  "themeName": "Viaggi",
  "derivedFromRecapId": null,
  "derivedFromTitle": null,
  "derivedFromAuthor": null,
  "pages": 
    {
      "id": 1,
      "pageIndex": 0,
      "image": {
        "id": 1,
        "filePath": "/img/viaggi/bg01.jpg",
        "slotsCount": 1,
        "slotsLayoutJson": "[{\"top\":25,\"left\":10,\"width\":80}]"
      },
      "texts": [
        {
          "slotIndex": 0,
          "text": "Il mio anno in Viaggio - 2025"
        }
      ]
    }
  }
  ```
- GET `/api/recaps/:recapId/edit`
  - Parameters: recapId
  - Response: returns a status code (200, 400 invalid recap, 401 not logged in, 403 not owner, 404 not found, 500 db error)
  - Purpose: used by the Edit page to verify whether the authenticated user can edit the recap
  ```
  {
    "ok": true
  }
  ```
- POST `/api/recaps`
  - Parameters / body: sourceType (template or public recap), sourceId, title
  - Response: id of the newly created recap
  - Purpose: creates a new recap starting from a template or another user’s public recap.
  ```
  {
  "id": 17
  }
  ```
- PUT `/api/recaps/:recapId`
  - Parameters: recapId (integer)
  - Parameters / body: title, visibility
  - Response: empty object
  - Purpose: updates the main recap information (title and visibility).
- PUT `/api/recaps/:recapId/pages`
  - Parameters: recapId (integer)
  - Parameters / body: list of pages with images and texts
  - Response: empty object
  - Purpose: updates recap pages (background images and texts).

- GET `/api/users/me/recaps`
  - Parameters: none
  - Response: list of recaps created by the authenticated user
  - Purpose: displays the user’s recaps, including private ones.
  ```
  {
    "id": 1,
    "title": "Il mio anno in Viaggio - 2025",
    "visibility": "public",
    "author": "Mario Rossi",
    "theme": "Viaggi"
  },
  {
    "id": 2,
    "title": "Viaggi - Low Cost Moments",
    "visibility": "private",
    "author": "Mario Rossi",
    "theme": "Viaggi"
  }
  ```
- GET `/api/themes`
  - Parameters: none
  - Response: list of available themes (Viaggi, Gin)
  - Purpose: retrieves themes available for recap creation.
  ```
  {
    "id": 1,
    "name": "Viaggi"
  },
  {
    "id": 2,
    "name": "Gin"
  }
  ```
- GET `/api/themes/:themeId/images`
  - Parameters: themeId (integer)
  - Response: predefined images associated with the theme
  - Purpose: provides selectable background images for a specific theme.
  ```
  {
    "id": 1,
    "idTheme": 1,
    "filePath": "/img/viaggi/bg01.jpg",
    "slotsCount": 1,
    "slotsLayoutJson": "[{\"top\":25,\"left\":10,\"width\":80}]"
  },
  {
    "id": 2,
    "idTheme": 1,
    "filePath": "/img/viaggi/bg02.jpg",
    "slotsCount": 1,
    "slotsLayoutJson": "[{\"top\":25,\"left\":10,\"width\":80}]"
  }
  ```
- GET `/api/templates`
  - Parameters: none
  - Response: list of available templates with their theme
  - Purpose: allows template selection during recap creation.
  ```
  {
    "id": 1,
    "title": "Viaggi - Highlights of the year",
    "themeId": 1,
    "themeName": "Viaggi"
  },
  {
    "id": 2,
    "title": "Viaggi - Low Cost Edition",
    "themeId": 1,
    "themeName": "Viaggi"
  },
  ```

## Database Tables

### User

| Column     | Type    | Constraints                                  |
| ---------- | ------- | -------------------------------------------- |
| idUser     | INTEGER | PRIMARY KEY, AUTOINCREMENT                   |
| username   |   TEXT  | NOT NULL, UNIQUE                             |
| name       |   TEXT  | NOT NULL                                     |
| hash       |   TEXT  | NOT NULL                                     |
| salt       |   TEXT  | NOT NULL                                     |

### Theme

| Column     | Type    | Constraints                                  |
| ---------- | ------- | -------------------------------------------- |
| idTheme    | INTEGER | PRIMARY KEY, AUTOINCREMENT                   |
| name.      |   TEXT  | NOT NULL, UNIQUE                             |

### Image

| Column         | Type    | Constraints                              |
| -------------- | ------- | ---------------------------------------- |
| idImage        | INTEGER | PRIMARY KEY, AUTOINCREMENT               |
| idTheme        | INTEGER | NOT NULL, FOREIGN KEY(Theme.idTheme)     |
| filePath       |   TEXT  | NOT NULL                                 |
| slotsCount     | INTEGER | NOT NULL                                 |
| slotsLayoutJson|   TEXT  | NOT NULL                                 |

### Template

| Column     | Type    | Constraints                                  |
| ---------- | ------- | -------------------------------------------- |
| idTemplate | INTEGER | PRIMARY KEY, AUTOINCREMENT                   |
| idTheme    | INTEGER | NOT NULL, FOREIGN KEY(Theme.idTheme)         |
| title      |   TEXT  | NOT NULL                                     |


### Template_Page

| Column        | Type    | Constraints                               |
| ------------- | ------- | ----------------------------------------- |
| idTemplatePage| INTEGER | PRIMARY KEY, AUTOINCREMENT                |
| idTemplate    | INTEGER | NOT NULL, FOREIGN KEY(Template.idTemplate)|
| pageIndex     | INTEGER | NOT NULL                                  |
| idImage       | INTEGER | NOT NULL, FOREIGN KEY(Image.idImage)      |

### Template_Text

| Column        | Type    | Constraints                                        |
| ------------- | ------- | -------------------------------------------------- |
| idTemplateText| INTEGER | PRIMARY KEY, AUTOINCREMENT                         |
| idTemplatePage| INTEGER | NOT NULL, FOREIGN KEY(Template_Page.idTemplatePage)|
| slotIndex     | INTEGER | NOT NULL                                           |
| text          |   TEXT  |                                                    |

### Recap
| Column        | Type    | Constraints                                        |
| ------------- | ------- | -------------------------------------------------- |
| idRecap       | INTEGER | PRIMARY KEY, AUTOINCREMENT                         |
| title         | TEXT    | NOT NULL                                           |
| visibility    | TEXT    | NOT NULL                                           |
| idTheme       | INTEGER | NOT NULL, FOREING KEY (Theme.idTheme)              |
| idUser        | INTEGER | NOT NULL, FOREING KEY (User.idUser)                |
| authorName    | TEXT    | NOT NULL                                           |
| derFromRecapId| INTEGER | FOREIGN KEY(Recap.idRecap)                         |
| derFromTitle  | TEXT    |                                                    |
| derFromAuthor | TEXT    |                                                    |

### Recap_Page
| Column	      | Type	  | Constraints                                        |
| ------------- | ------- | -------------------------------------------------- |
| idRecapPage	  | INTEGER	| PRIMARY KEY, AUTOINCREMENT                         |
| idRecap	      | INTEGER	| NOT NULL, FOREIGN KEY(Recap.idRecap)               |
| pageIndex	    | INTEGER	| NOT NULL                                           |
| idImage	      | INTEGER	| NOT NULL, FOREIGN KEY(Image.idImage)               |

### Recape_Text
| Column	      | Type	  | Constraints                                        |
| ------------- | ------- | -------------------------------------------------- |
| idRecapText	  | INTEGER |	PRIMARY KEY, AUTOINCREMENT                         |
| idRecapPage	  | INTEGER	| NOT NULL, FOREIGN KEY(Recap_Page.idRecapPage)      |
| slotIndex	    | INTEGER	| NOT NULL                                           |
| text	        | TEXT	  |                                                    |


## Main React Components

- `Login` (in `Login.jsx`):
  - Purpose: Handles user authentication.
  - Main functionality: Validates user inputs and sends the login request to the server via API; updates the application’s authentication state.
- `NavBar` (in `NavBar.jsx`):
  - Purpose: Main navigation bar of the application.
  - Main functionality: Displays the app name, main links, and, if the user is authenticated, the username and the logout button.
- `ProgressBar` (in `progress.jsx`):
  - Purpose: Progress navigation bar for screens, prev and next.
  - Main functionality: Allows users to view progression through pages in the RecapViewer route and through recaps on the home page, and enables navigation via prev and next buttons to move forward and backward between pages or public recaps.
- `StoryGreeting` (in `StoryGreeting`):
  - Purpose: Indicates that at a given moment the user is authenticated with a specific profile.
  - Main functionality: Displays the user’s first and last name, providing additional confirmation that the user is currently authenticated.
- `RecapForm` (in `RecapForm.jsx`)
  - Purpose: Manages the recap title and visibility during both creation and editing of a recap.
  - Main functionality: Updates the database via API whenever changes are made to the recap title and visibility. Handles the layout structure of the form.
- `PagesEditor` (in `PagesEditor`)
  - Purpose: Manages the overall editing of a recap’s pages.
  - Main functionality: Renders the list of pages, validates minimum requirements, and allows saving changes via API.
- `PagesCard` (in `PagesCard`)
  - Purpose: Manages the editing of a single recap page.
  - Main functionality: Allows selection of a theme image and editing of associated texts, propagating changes to the parent component.
- `RecapViewer` (in `RecapViewer.jsx`)
  - Purpose: Displays a recap in read-only mode.
  - Main functionality: Shows the recap pages with graphical layout and sequential navigation.
- `Profile` (in `Profile.jsx`)
  - Purpose: Displays the recaps belonging to the authenticated user.
  - Main functionality: Allows viewing and editing access to the user’s personal recaps.

- `Home` (in `Home.jsx`)
  -  Purpose: Displays the list of available public recaps.
  - Main functionality: Shows recaps in “story” mode with progressive navigation.
- `Editor` (in `Editor.jsx`)
  - Purpose: Allows full editing of an existing recap.
  - Main functionality: Manages recap metadata and pages, coordinating loading, validation, and saving via API.

- `Create` (in `Create.jsx`)
  - Purpose: Allows the creation of a new recap starting from a template or a public recap.
  - Main functionality: Sends a creation request to the backend and redirects to the editor of the newly created recap.

## Screenshot
Home
![Home Preview](client/screenshot/Home.jpg)
Login
![Login Preview](client/screenshot/Login.png)
Recap Viewer
![Recap Viewer Preview](client/screenshot/RecapViewer.jpg)
Profile Page
![Profile Page Preview](client/screenshot/Profile.jpg)
Create Recap
![Create Recap Preview](client/screenshot/Create.jpg)
Edit Recap
![Edit Recap Preview](client/screenshot/Editor.jpg)
Page not found
![Page Not Found Preview](client/screenshot/NotFound.jpg)

## Users Credentials

- user1, password1 (author of public and private recaps on the Travel and Gin themes)
- user2, password2 (includes at least one recap derived from another user’s public recap)
- user3, password3 (author of public recaps visible on the home page)


## How to run

- Server : 
  - cd server
  - npm install
  - node index.mjs
    - http://localhost:3001

- Client :
  - cd client
  - npm install
  - npm run dev
    - http://localhost:5173
