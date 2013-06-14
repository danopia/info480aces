@INFO480Aces
============

Real-time Twitter RT visualization with the streaming API and NodeJS.


*NOTE:* Twitter made a breaking change on Wednesday, June 12th, that broke how we connect to the streaming API. In
order to fix it, we would need to switch to OAuth2. I plan to make this change soon, but have not yet, so this codebase
will not run. :(

### Dependancies
There's no `package.json` because I'm a slacker. You'll need NodeJS (any recent version) and NPM.

Once you have that, install the communications lib:

    npm install socket.io

### Config
\#TODO once we reimplement auth

### Tech
There's two components to this project, the server and the clients.

The server exists solely to stream tweets from
Twitter, do some simple filtering for RTs, and fan them out to all of the connected clients. If the Twitter API was
client-accessible, then the server would not be needed as-is. It would be a better design to move more stuff to the
server and actually make it useful, but this has not been done.

The client (`index.html`) is the majority of the code. It itself can be broken into multiple sections:

* Socket logic and support functions, which work to build a realtime OT/RT database and offer this data to whoever
  wants it.
* UI handler functions, which do things such as drawing lines between RTs, handling clicking, and implementing the
  various controls in the right pane.
* Timers:
    * Every 0.5 seconds, update the plot with new data.
    * Every 5 seconds, delete data from the database and plot that's more than 10 minutes old.
    * Every 30 seconds, update the Top 5 pane.
    * The pause/resume button toggles all three timers.
* Downloader, which builds a CSV data file from the in-memory tweet database, and offers it to the user as a download.
* Plotter, which uses d3.js to set up and endlessly update a rolling visual plot of the tweet database.
