![](https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F-at%20Technologiestiftung%20Berlin-blue)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# BranchenPuls - database setup & update

**This application is a prototype. It may contain errors and small bugs. If you notice something you can report an issue. Thank you!**

The Repo contains everything you will need to setup a PostgreSQL database for [BranchenPuls](https://github.com/technologiestiftung/branchenpuls) and import the raw [data](https://github.com/IHKBerlin/IHKBerlin_Gewerbedaten/tree/master/archivedData) to a DB.

## Setup

Create a PostgreSQL database (e.g. by using a client like pgAdmin) called `ihk-db`.

Then run the following SQL queries from your preferred database client. This will set up all the tables and functions.

Set up tables:

```plain
queries/setupTables.sql
```

Set up functions:

```plain
queries/setupFunctions.sql
```

## Upload data to your local DB

In the _scripts_ folder, you will find a script called _addMonthlyData.js_ which helps you to import the raw data for a single month. You have to change the connection details in the code if you want to write the data to your local DB.

Install the necessary libraries (you will need npm to be installed).

```code
npm install
```

Then download the [IHK data](https://github.com/IHKBerlin/IHKBerlin_Gewerbedaten/tree/master/archivedData) from the IHK repo where the files are named something like: "IHKBerlin_Gewerbedaten_07-2023". Save the file in the folder "scripts/tempData".

To import the data run the following command. You will need to adjust the 2 arguments (month and year) according to your date.

```code
node addMonthlyData.js 07 2023
```

## Auto-Update

The repo contains a Github Actions script (`.github/workflows/add-monthly-data-yml`) which runs every month. It downloads the most recent data from the IHK repo and writes it to a Supabase DB.

Connection details for Supabase need to be provided in Github. The connection details are suggested in `.env.example`. If you do not know how to obtain the necessary details, please ask a repository maintainer for access. You can also use other basemaps by providing your own style file.

## Contributing

Before you create a pull request, write an issue so we can discuss your changes.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://hanshack.com/"><img src="https://avatars.githubusercontent.com/u/8025164?v=4?s=64" width="64px;" alt="Hans Hack"/><br /><sub><b>Hans Hack</b></sub></a><br /><a href="https://github.com/technologiestiftung/ihk-db/commits?author=hanshack" title="Code">💻</a> <a href="https://github.com/technologiestiftung/ihk-db/commits?author=hanshack" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Credits

<table>
  <tr>
    <td>
    Made by: <a href="https://odis-berlin.de">
        <br />
        <br />
        <img width="200" src="https://logos.citylab-berlin.org/logo-odis-berlin.svg" />
      </a>
    </td>
    <td>
      Together with: <a href="https://citylab-berlin.org/en/start/">
        <br />
        <br />
        <img width="200" src="https://logos.citylab-berlin.org/logo-citylab-berlin.svg" />
      </a>
    </td>
    <td>
      A project by: <a href="https://www.technologiestiftung-berlin.de/en/">
        <br />
        <br />
        <img width="150" src="https://logos.citylab-berlin.org/logo-technologiestiftung-berlin-en.svg" />
      </a>
    </td>
    <td>
      Supported by <a href="https://www.berlin.de/rbmskzl/">
        <br />
        <br />
        <img width="80" src="https://citylab-berlin.org/wp-content/uploads/2021/12/B_RBmin_Skzl_Logo_DE_V_PT_RGB-300x200.png" />
      </a>
    </td>
  </tr>
</table>
