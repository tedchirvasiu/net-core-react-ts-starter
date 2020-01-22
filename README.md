# .Net Core React + Typescript + Webpack tutorial

Run the following 2 commands to restore the project: 
```
npm install
npm run watch
```
  
Here are the steps to do it yourself from scratch:

**Step 1:** Install Node and NPM (if you don't have them already) from https://nodejs.org/en/download/

**Step 2:** Create a new **empty** .Net Core web application. We're gonna go as bare bones as possible with this.

**Step 3:** Open a command window and change the working directory to your **project** folder. Alternatively, in VS you could right click on your Project and click "Open Folder in File Explorer". Then in the address bar of the windows explorer type "cmd". This should open a cmd window with the working dir already set.
Now in the command window type the following 2 commands:

```
    npm init -y
    npm install --save-dev webpack webpack-cli clean-webpack-plugin html-webpack-plugin typescript ts-loader react react-dom @types/react @types/react-dom
```

The first line will initialize your package.json file. The second line will install webpack, react, typescript, the typings for react and a couple of webpack plugins we're going to use for the build process.

**Step 4:** Since this will be a single page application, we're gonna need a main controller and view to render the initial page. So go to your project, right click, Add -> New Folder and create a folder named "Controllers". Right click on the newly created folder, go to Add -> Controller... and create a new empty MVC controller named DefaultController. This should simply have an Index method returning a View().

**Step 5:** Create a folder named "Views" and inside it create a folder named "Default" to match your DefaultController. Basic MVC stuff so far. Here comes something different: you're going to create a file named "Index_template.cshtml" with the following content

```
    <!DOCTYPE html>
    <html>
    <head>
        <% for (var css in htmlWebpackPlugin.files.css) { %>
        <link href="<%= '@Url.Content("~' + htmlWebpackPlugin.files.css[css] + '")' %>" rel="stylesheet">
        <% } %>
    </head>
    <body>

        <div id="app"></div>

        <script>
            window.baseUrl = "@Url.Content("~/")";
            window.resourcesBaseUrl = "@Url.Content("~/dist/")";
        </script>

        <% for (var chunk in htmlWebpackPlugin.files.chunks) { %>
        <script src="<%= '@Url.Content("~' + htmlWebpackPlugin.files.chunks[chunk].entry + '")' %>"></script>
        <% } %>
    </body>
    </html>
```

Why _template? Everytime you change something in your frontend code, Webpack will rebuild your app and create a new bundle (a new big javascript file containing all your code), and this bundle will have a different name everytime (because it contains a hash so you won't have problems with caching). We don't want to manually update the script reference in our view everytime a new bundle is generated, so we will use Webpack to generate our actual Index.cshtml file. You can see it is not even valid cshtml (you can change the extension to something else if it causes trouble) since it has those <% tags which sort of resemble the old ASPX days. This is called ejs syntax and is used by html-webpack-plugin to know where to insert the bundles.
You can also see we use some razor syntax too to obtain the base URL of the app. This is optional for our purpose, but it can come in handy if you host your app as a subsite. You can also obtain other information in this step from the server (like say the application version) without doing other round-trips. In really brings the best of all worlds.

**Step 6:** Update your Startup.cs to use MVC, serve Static Files (to obtain our javascript code) and route all unused paths to our DefaultController.

``` 
        public void ConfigureServices(IServiceCollection services) {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env) {
            if (env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();

            app.UseMvc(routes => {
                routes.MapRoute("default", "{controller=Default}/{action=Index}");
                routes.MapRoute("catch-all", "{*url}", new { controller = "Default", action = "Index" });
            });
        }
```

**Step 7:** In your project, create a new file named "tsconfig.json" with the following content:

```
    {
      "compilerOptions": {
        "baseUrl": "./",
        "target": "es5",
        "lib": [
          "es2017",
          "dom"
        ],
        "sourceMap": true,
        "allowJs": true,
        "noImplicitAny": false,
        "moduleResolution": "node",
        "jsx": "react"
      }
    }
```

Make sure the Build Action is set to "None", otherwise VS might get annoying about it and start compiling the ts files for you.

**Step 8:** Now we need to configure webpack. Create another file in your project root named "webpack.config.js" with the following code:

```
    const path = require('path');
    const devMode = process.env.NODE_ENV !== 'production';
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const { CleanWebpackPlugin } = require('clean-webpack-plugin');

    module.exports = {
        entry: {
            app: './src/main.tsx'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json']
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    include: path.resolve(__dirname, "src"),
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(), //This empties the dist folder
            new HtmlWebpackPlugin({
                chunks: ['app'],
                inject: false, //We generate the tags manually with lodash templating
                template: path.resolve(__dirname, 'Views/Default/Index_template.cshtml'), //This is our template
                filename: path.resolve(__dirname, 'Views/Default/Index.cshtml') //This is our actual Index.cshtml file
            })
        ],
        output: {
            filename: devMode ? '[name].bundle.[hash].js' : '[name].bundle.[chunkhash].js',
            path: path.resolve(__dirname, 'wwwroot/dist'), //This is where our bundles are going to go
            publicPath: '/dist/'
        }
    };
```

**Step 9:** We are almost done with the setup. All we have to do now is create a few shortcuts for the commands we are going to use for building. Go to the package.json file and inside the "scripts" object, use the following:

```
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "build-dev": "set NODE_ENV=development&& webpack -d",
        "watch": "set NODE_ENV=development&& webpack --watch -d",
        "build": "set NODE_ENV=production&& webpack -p"
    }
```

**Step 10:** Okay, this was it for the setup. All there's left to do is create a new folder in your project named "src". Here you'll have all your source code for the front-end stuff. Inside src create a main.tsx file. This will be your entry point. Paste the following hello-world code in it:

```
    import * as React from 'react'
    import * as ReactDOM from 'react-dom'

    ReactDOM.render(<div>Hello world!</div>, document.getElementById('app'));
```

**Step 11:** Finally let's build and run our app. In that command window you opened in step 3, type

```
    npm run watch
```

This will run the command we specified at step 9 in the package.json file. Now webpack will build our app and watch for any changes. When it sees that the code in the src was modified, it will rebuild automatically. When you are ready to release, use "npm run build" instead to create an optimized bundle.

Now simply hit play and run your server (F5). You should see your hello world react app :)