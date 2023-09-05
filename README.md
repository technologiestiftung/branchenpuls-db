![](https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F-at%20Technologiestiftung%20Berlin-blue)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# IHK - DB Setup & Update

[Data](https://github.com/IHKBerlin/IHKBerlin_Gewerbedaten/tree/master/archivedData)

## Setup

Create a Postgres DB with a name (default: ihk-db) of your choice.

Then run the following SQL queries from your prefered database client. This will set up all the tables and functions.

```plain
queries/setupTables.sql
```

```plain
queries/setupFunctions.sql
```

## Upload data to your local DB

In the _scripts_ folder there is a script called _addMonthlyData.js_. You should change the connection details here if you want to write the ihk data to your local DB.

Then download the IHK data from the IHK repo where the files name are called something like: "IHKBerlin_Gewerbedaten_07-2023". Save the file in the folder "scripts/tempData".

To import the data run the following comand. You will need to adjust the 2 arguments (month and year) according to your date.

```code
node addMonthlyData.js 07 2023
```

## Auto-Update

In the _scripts_ folder there is a script called _addMonthlyData.js_. The script is executed by Github Actions and should run every month. It downloads the most recent data from the IHK repo and writes it to the DB.

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
