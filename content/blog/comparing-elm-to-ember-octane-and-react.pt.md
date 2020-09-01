+++
title = "Comparando Elm a Ember Octane e React"
description = "Comparando Elm a Ember Octane e React"
date = 2020-05-12
[extra]
author = "Éber F. Dias"
+++
Today I stumbled on this article "[Comparing Ember Octane and React](https://www.pzuraq.com/comparing-ember-octane-and-react/)" on Hacker News.

The article goes to demonstrate how the same application can be built both with React and Ember, going into implementation details and drawing some conclusions from it. The app is a simple Hacker News search that you can test yourself here:

- [React](https://codesandbox.io/s/github/the-road-to-learn-react/hacker-stories/tree/hs/Async-Await-in-React)
- [Ember](https://glitch.com/~comparing-ember-octane-and-react)

At the end of the article, the author ([Chris Garrett](https://www.pzuraq.com/author/pzuraq/), which is an Ember Core team member) writes:

> In writing this post, I feel like I got to experience React with hooks much more deeply than the research I've done before, and I enjoyed learning them and working with them. It is an interesting programming model, and while I'm not entirely sold yet (I think I'd still prefer something more akin to **Elm** personally) I can definitely see why people like them, and what the advantanges are.

That had me wondering: what the Elm version of the same app would look like? So I tried to build it! You can see the ending result [here](https://ellie-app.com/8Rn7dL9RKyWa1).

Like in the original post, let's take a deeper look at what is going on here.

# Getting started

```elm
port module Main exposing (main)

import Browser
import Browser.Dom as Dom
import Html exposing (Html, a, button, div, h1, hr, input, label, p, span, strong, text)
import Html.Attributes exposing (disabled, for, href, id, type_, value)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as Decode exposing (Decoder)
import Task


port sendQuery : String -> Cmd msg
```

This is how most Elm applications (and files) start. You define the file's module name and explicitly declares what you want to expose and import from other modules. Elm has it's own package manager and when you create a new project, it will install a few basic packages to get you going. We also had to install some extra packages like `elm/json` and `elm/http`.

One particular thing about our module is the fact that we start it by saying `port module`. In case you are not familiar with Elm, it is a purely functional language that can't have side effects. That means we can't, for instance, set things to `localStorage` from our Elm code. That is where ports come in, but we will talk about it later. At the end of this section, we declare a port named `sendQuery` that we will use later on.

```elm
type alias Story =
    { id : String
    , title : String
    , author : String
    , url : String
    , comments : Int
    , points : Int
    }


type alias Model =
    { input : String
    , lastSearch : String
    , stories : Stories
    }


type Stories
    = Loading
    | Error
    | Stories (List Story)


type Msg
    = NoOp
    | GotInput String
    | Search
    | Dismiss String
    | GotResults (Result Http.Error Stories)
```

Here we have our types definitions. Elm is a strong and static typed language. That means we can create our types to help model the application. First, we have two alias types: `Story` and `Model`. An alias type just gives a nickname to some other typed structure. That way we can use the compiler to help us write the correct structure every time.

Later we have some custom types: `Stories` and `Msg`. Those types will help us to keep a better understanding of our application's state and what we should do about it.

# The TEA

The TEA (or The Elm Architecture) is a way to describe how most Elm applications work in terms of how the data flows through our code. It consists of a few basic concepts:

- We have one global state;
- That state is rendered using some `view` function;
- The `view` can send messages to some kind of `update` function (picture a button click or form submission);
- Finally, the `update` mutates the state that is re-rendered by the `view`.

That is it! So let's build those functions:

```elm
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        GotInput i ->
            ( { model | input = i }, Cmd.none )

        Search ->
            if model.input /= model.lastSearch then
                ( { model | lastSearch = model.input, stories = Loading }
                , Cmd.batch
                    [ request model.input
                    , sendQuery model.input
                    , focusSearch
                    ]
                )

            else
                ( model, Cmd.none )

        Dismiss id_ ->
            let
                stories_ =
                    case model.stories of
                        Stories s ->
                            Stories (List.filter (.id >> (/=) id_) s)

                        _ ->
                            model.stories
            in
            ( { model | stories = stories_ }, Cmd.none )

        GotResults res ->
            case res of
                Err e ->
                    let
                        _ =
                            Debug.log "error" e
                    in
                    ( { model | stories = Error }, Cmd.none )

                Ok s ->
                    ( { model | stories = s }, Cmd.none )


view : Model -> Html Msg
view model =
    div [] <|
        h1 [] [ text "My Hacker Stories" ]
            :: searchForm model.input
            ++ stories model.stories


searchForm : String -> List (Html Msg)
searchForm input_ =
    [ label [ for "search" ] [ strong [] [ text "Search:" ] ]
    , input [ id "search", value input_, onInput GotInput, type_ "text" ] []
    , button [ disabled (input_ == ""), onClick Search ] [ text "Submit" ]
    , hr [] []
    ]


stories : Stories -> List (Html Msg)
stories stories_ =
    case stories_ of
        Loading ->
            [ p [] [ text "Loading ..." ] ]

        Error ->
            [ p [] [ text "Something went wrong ..." ] ]

        Stories [] ->
            [ p [] [ text "No results." ] ]

        Stories list ->
            List.map storyItem list


storyItem i =
    div []
        [ span [] [ a [ href i.url ] [ text i.title ] ]
        , text " "
        , span [] [ text i.author ]
        , text " "
        , span [] [ text (String.fromInt i.comments) ]
        , text " "
        , span [] [ text (String.fromInt i.points) ]
        , text " "
        , span [] [ button [ onClick (Dismiss i.id) ] [ text "Dismiss" ] ]
        ]
```

Here we have an `update` function that will receive our model and a message. Remember our types `Model` and `Msg`? We are going to use them here. We need to check which `Msg` we are getting and make the appropriate changes to the `Model`. And if you are paying attention you can see that we don't just return our `Model`, but a `Cmd msg` type (command). Remember when I said Elm can't have side effects? To solve that we have commands, which are a special type that we can handle to the Elm runtime to solve for us. It can be, for instance, an HTTP request like we are doing when `Msg` is `Search`. More on that later...

After that, we have a few different functions that will return the type `Html`. That is different from returning actual HTML, but that is how we implement templates and components with Elm. Using plain functions! The Elm runtime will take care of things and render proper HTML from that.

Now, let's wire it all together:

```elm
main : Program String Model Msg
main =
    Browser.element
        { init =
            \query ->
                ( { input = query, lastSearch = query, stories = Loading }
                , Cmd.batch [ request query, focusSearch ]
                )
        , view = view
        , update = update
        , subscriptions = always Sub.none
        }
```

The `main` function is the entry point of our application. It is what the Elm runtime will look for and run once it kicks in. Here we are explicitly saying which functions our application will use for each stage of TEA. The `init` key is a function that should set up the initial model. Keys `view` and `update` are pretty self-explanatory by now. Finally, we have `subscriptions` that we won't use for this app but if you are interested, take a look at the [elm guide](https://guide.elm-lang.org/).

# The missing stuff

Finally we have a few extra functions that will make our interaction with the application more dynamic:

```elm
focusSearch : Cmd Msg
focusSearch =
    Task.attempt (\_ -> NoOp) (Dom.focus "search")


request : String -> Cmd Msg
request query =
    Http.get
        { url = "https://hn.algolia.com/api/v1/search?query=" ++ query
        , expect = Http.expectJson GotResults resultsDecoder
        }


resultsDecoder : Decoder Stories
resultsDecoder =
    Decode.field "hits" (Decode.list storyDecoder)
        |> Decode.andThen (Decode.succeed << Stories)


storyDecoder : Decoder Story
storyDecoder =
    Decode.map6 Story
        (Decode.field "objectID" Decode.string)
        (Decode.field "title" Decode.string)
        (Decode.field "author" Decode.string)
        (Decode.field "url" Decode.string)
        (Decode.field "num_comments" Decode.int)
        (Decode.field "points" Decode.int)
```

The function `focusSearch` is just a helper function that returns a command to inform the Elm runtime to focus on an element with a specific `id` and that is it. That one I straight copied from the Elm guide.

The real important function comes next: `request`. It receives a query string and creates a command that runs an HTTP request. This is where Elm shines for me. After making a request the runtime will send a new message for the application with some data. In our case we are telling the runtime to return the data with the `GotResults` message, expecting a JSON that can be successfully decoded with the `resultsDecoder` function. See, everything in Elm is typed and we can't just receive arbitrary data from the server. How would the compiler know which type of data are we dealing with? That is why we have to decode the JSON that we get, making it fit at a specific type. In our case, we need the JSON to return a valid `Stories` type.

If you take a look at the way we handle the `GotResults` message on our `update` function, you will see that the returning data can either be `Ok ...` or an `Err ...`. An `Err` may occur if the HTTP request fails or if the JSON decoding fails.

# We still need JS after all...

```html
<html>
<head>
  <style>
    /* you can style your program here */
  </style>
</head>
<body>
  <main></main>
  <script>
    var app = Elm.Main.init({
      node: document.querySelector('main'),
      flags: localStorage.getItem('searchTerm') || 'Elm'
    });

    app.ports.sendQuery.subscribe(query => localStorage.setItem('searchTerm', query));
  </script>
</body>
</html>
```

The important bit about the HTML/JS part of our app is how we start it. On the `init` function call we can pass the value of the current data stored at the `localStorage` to our application. Take a look at the `init` function on the Elm side to see how we handle that.

After that, we use the `sendQuery` port to save the search query every time a new search occurs. Take a look at the `Search` message handling we do on the `update` function to see the use to the `sendQuery` port we defined right at the beginning of our module.

# Takeaways

I have no real experience with React or Ember so this section won't be as well informed or in-depth as in the original article is. But let's take a look at how Elm solves some of our problems in a very efficient and easy way.

## Custom types are a game-changer

The React implementation on the `storiesReducer` function will do something like what our `update` function does. The real problem here is that it uses plain strings as keys for the possible actions it can execute. That is fine until you need more messages/actions.

Because we are using an actual custom type as our message (we could be using strings but that wouldn't help), we need to handle every possible message that there is. If we need more messages we can just add them to our `Msg` type and the compiler will politely tell us about all the places where we need to handle that new message if we miss something.

## Custom types are a game-changer ²

Both on the React and Ember apps you will see that the "model" has a few flags like `isLoading` or `isError`. All that those flags are doing is informing the state of the stories we are trying to load. See how we always need to worry about resetting the values of those flags so we don't end up with a view that says that we have an error and we are loading at the same time. Nothing is preventing that from happening...

We can solve that by using a custom type that can represent the state of those stories only once at a time. It can't be `Loading` and `Error` at the same time, so we have certainty that our view will always render the right thing no matter what.

## JSON decoding

We have a bug in this app. See... A story title or author can be a `null` value coming back from the API call. If you open up the React or Ember apps and search for "elmish" for instance, you will get a few funny looking lines. That is because JavaScript won't stop you from accessing data that don't exist on a given object, rendering a pretty confusing and uninformative list of... things.

That can't happen with Elm. Besides the fact that we can use alias types to inform our compiler about the shape of some structures, when receiving data from the outside world it has to pass through a decoding process and that decoding can either work or fail: Elm will force us to handle both situations or it won't compile our program. Search for "elmish" on the Elm version of the app and you will see the message "Something went wrong ...". That is because our decoder only decodes strings for the `title` key, and if that key is `null` on the JSON side, it won't decode at all.

We could then update our decoder to handle those situations, maybe making the `title` key a `Maybe String`, and that would force us to handle the fact the `title` can either be `Just ...` something or `Nothing` in our `view` function. We could never reproduce those silly and confusing lines you get from using "plain" JavaScript.

## A simple take

Hooks, components, tracked properties, actions, and so on... JS-land apps can have a lot of concepts that require time to learn and master. Elm, on the other hand, is pretty simple. Despite its somewhat cryptic syntax, if you never dealt with anything like it, Elm introduces very few concepts: everything is a function, and the way you make your application work is through the iteration of TEA, just like that.

---

I fell like I'm having a very superficial take on top of such a well informed and well-written article like the one this is based on, but hopefully, I succeeded at showing how Elm would solve similar problems pointing at the exciting things it brings to the table.

What am I missing from my list of takeaways? Is there any place where the React/Ember solutions are better? Please, let me know in the comments section. Cheers!
