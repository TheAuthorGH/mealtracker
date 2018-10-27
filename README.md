# MealTracker

_MealTracker_ is a web application that lets you keep a data-rich journal of what you eat, when you it eat, and how it contributes to your nutrition.

## Demo

You can use a live demo of this app [here](https://agile-ridge-29125.herokuapp.com/).

## Screenshots

![Screenshot of the index page](https://github.com/TheAuthorGH/mealtracker/blob/master/screenshots/1.PNG)

The index page.

![Screenshot of the signup page](https://github.com/TheAuthorGH/mealtracker/blob/master/screenshots/2.PNG)

The signup page.

![Screenshot of the entry form](https://github.com/TheAuthorGH/mealtracker/blob/master/screenshots/3.PNG)

Adding a new journal entry.

![Screenshot of journal insights](https://github.com/TheAuthorGH/mealtracker/blob/master/screenshots/4.PNG)

Viewing journal insights.

## For Developers

MealTracker is a fullstack web application.

MealTracker features the following:
* A server built with Node.js and Express providing a RESTful API.
* User data persistence using MongoDB.
* Full user-friendly client app built with plain HTML, CSS and JavaScript.
* User authentication system built with JWTs, cookies and bcrypt.
* Mocha-powered Unit Testing (serverside only).

## The MealTracker API

The MealTracker API is divided as follows:

### Users

The Users API allows basic control over MealTracker users.:

User properties:
- email: Unique and used for auth.
- password: Used for auth, but never exposed by the API after set.

Operations:
- GET /users/?userid: Returns superficial information about a user.
- POST /users: Allows you to create a user. Requires providing an email and a password.

### Journals

The Journals API allows you to gather user journal information provided you have a user's ID. All operations require providing authentication.

Journal Properties:
- user: ID of the user who owns this journal.
- title: Displayed to the client for aesthetics, but not unique.
- creationDate: Used to generate certain insight messages.

Operations:
- GET /journals/?userid&journalid: Gets a specific journal's superficial information.
- POST /journals/?userid: Creates a new journal with the specified title.

### Entries

The Entries API allows you to manipulate journal entries. All operations require providing authentication. It's mandatory to redundantly provide the user's ID in every operation to improve security.

Entry Properties:
- title: The entry's title. Cannot be longer than 20 characters.
- description: The entry's description text. Cannot be longer than 300 characters.
- positive: A boolean property that marks an entry as healthy or otherwise.

Operations:
- GET /journals/entries/?userid&journalid&perpage&page&search: Returns paginated entries, sorted by date.
- POST /journals/entries/?userid&journalid: Pushes an entry to a journal. Requires the entry's title, description and positivity.
- PUT /journals/entries/?userid&journalid&entryid: Updates an entry. You can omit fields in the request's body to leave them unchanged.
- DELETE /journals/entries/?userid&journalid&entryid: Deletes an entry.

### Insights

The Insights API provides only a single GET endpoint with messages about a journal.

Operations:

- GET /journals/insights?userid&journalid: Get insights as an array. 

## About

Developed by Luis Lau.
Email: theauthorgm@gmail.com

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, you can find it [here](https://www.gnu.org/licenses/>).
