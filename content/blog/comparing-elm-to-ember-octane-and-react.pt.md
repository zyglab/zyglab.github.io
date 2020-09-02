+++
title = "Comparando Elm a Ember Octane e React"
description = "Comparando Elm a Ember Octane e React"
date = 2020-05-12
[taxonomies]
tags = ["elm", "ember", "react", "funcional"]
[extra]
author = "Éber F. Dias"
base_path = "@/blog/comparing-elm-to-ember-octane-and-react.md"
+++
Hoje me deparei com o artigo "[Comparing Ember Octane and React](https://www.pzuraq.com/comparing-ember-octane-and-react/)" no Hacker News.

Ele tenta demonstrar como uma mesma aplicação pode ser construída tanto com React quanto Ember, detalhando suas implementações e chegando a algumas conclusões a partir disto. A aplicação é um simples sistema de busca do Hacker News que você pode testar aqui:

- [React](https://codesandbox.io/s/github/the-road-to-learn-react/hacker-stories/tree/hs/Async-Await-in-React)
- [Ember](https://glitch.com/~comparing-ember-octane-and-react)

Ao final do artigo, o autor ([Chris Garrett](https://www.pzuraq.com/author/pzuraq/), que é um membro do core team do Ember) escreve:

> Escrevendo este post, eu sinto que pude experimentar React com hooks de forma muito mais profunda que nas minhas pesquisas anteriores, e eu gostei muito do que aprendi. É um modelo de programação interessante, e enquanto não esteja totalmente convencido ainda (pessoalmente eu acho que prefiro algo mais parecido com **Elm**), posso ver claramente porque as pessoas gostam dele e quais são suas vantagens.

Isso me fez pensar: como seria a versão Elm da mesma aplicação? Então eu tentei contruí-la! Você pode ver o resultado final [aqui](https://ellie-app.com/8Rn7dL9RKyWa1).

Como no post original, vamos dar uma olhada mais profunda no que está acontecendo.

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

É assim que a maioria das aplicações Elm (e arquivos) começam. Você define o nome do módulo do arquivo e explicitamente declara o que quer expor e importar de outros módulos. Elm tem seu próprio package manager e quando você cria um novo projeto, ele irá instalar alguns pacotes básicos. Nós tivemos que instalar alguns pacotes extras como `elm/json` e `elm/http`.

Uma coisa importante do nosso módulo é que ele começa com o texto `port module`. Caso você nunca tenha ouvido falar de Elm, ela é uma linguagem funcional totalmente pura que não pode ter efeitos colaterais. Isso significa que não podemos, por exemplo, definir coisas no nosso `localStorage` a partir do código Elm. É aí que ports entram, mas vamos falar mais sobre isso depois. No final desta seção declaramos um port chamado `sendQuery` que usaremos mais à frente.

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

Aqui temos as definições dos nossos tipos. Elm é uma linguagem forte e estaticamente tipada. Isso significa que podemos criar nossos próprios tipos para modelar nossa aplicação. Promeiro temos dois tipos alias: `Story` e `Model`. Um tipo alias é um tipo que dá um apelido a uma estrutura já conhecida. Desta forma podemos depender do compilador pra nos ajudar a escrever códigos corretos o tempo todo.

Depois temos dois tipos customizados: `Stories` e `Msg`. Estes tipos irão nos ajudar entender melhor o estado da nossa aplicação e o que devemos fazer a seu respeito.

# A TEA

A TEA (ou The Elm Architecture) é uma forma de descrever como a maioria das aplicações Elm funcionam e como os dados fluem através de nosso código. Ela consiste em alguns conceitos básicos:

- Temos um estado global;
- Este estado é renderizado usando alguma função `view`;
- A `view` pode enviar mensagens de algum tipo para a função `update` (imagine um clique de botão ou o envio de um formulário);
- Por fim, o `update` muta o estado que então é renderizado novamente pela `view`.

E é isso! Então vamos construir estas funções:

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

Aqui temos uma função `update` que irá receber nosso model (estado) e mensagem. Lembra dos nossos tipos `Model` e `Msg`? Vamos usá-los aqui. Precisamos checar qual `Msg` estamos recebendo para realizar as mudanças apropriadas ao `Model`. E se você estiver prestando atenção vai ver que nós não retornamos apenas o `Model`, mas também um `Cmd msg` (comando). Lembra quando eu disse que Elm não tem efeitos colaterais? Pra resolver este problema temos comandos, que são um tipo especial que entregamos pro runtime do Elm resolver pra gente. Pode ser, por exemplo, uma requisição HTTP como a que estamos fazendo quando `Msg` é `Seach`. Mais sobre isso depois...

Depois disso, temos algumas funções especiais que irão retornar o tipo `Html`. Elas não retornam HTML em si, mas é assim que implementamos templates e componentes com Elm. Usando apenas funções! O runtime do Elm vai se encarregar de renderizar o HTML correto a partir delas.

Agora vamos juntar tudo:

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

A função `main` é o ponto de entrada da nossa aplicação. É a função que o runtime do Elm vai olhar assim que tudo for inicializado. Aqui estamos dizendo explicitamente quais funções nossa aplicação deve usar pra cada passo da TEA. a chave `init` é uma função que deve retornar nosso model (estado) inicial. As chaves `view` e `update` não precisam de maiores explicações. Por fim, temos a `subscriptions` que não vamos usar mas que se você estiver curioso pode dar uma olhada no [elm guide](https://guide.elm-lang.org/).

# O que ficou faltando

Por fim temos algumas funções extras que irão tornar a interação com nossa aplicação mais dinâmica:

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

A função `focusSearch` é apenas um helper que retorna um comando para informar o runtime do Elm para focar em um elemento com uma `id` específica e é isso. Eu copiei esta função inteira do elm guide.

A função realmente importante vem em seguida: `request`. Ela recebe uma query string e cria um comando que irá rodar uma requisição HTTP. É aqui que Elm brilha pra mim. Após fazer a requisição o runtime irá mandar uma nova mensagem pra nossa aplicação com os dados usando a mensagem `GotResults`, esperando um JSON que possa ser decodificado com sucesso pela função `resultsDecoder`. Veja, tudo em Elm é tipado então não podemos simplesmente receber qualquer tipo de dado do servidor. Como o compilador saberia com quais tipos estamos lidando? É por isso que temos que decodificar o JSON que recebemos, fazendo-o encaixar em algum tipo específico. No nosso caso, precisamos que o nosso JSON retorne um tipo `Stories` válido.

Se você der uma olhada na forma como lidamos com a mensagem `GotResults` na nossa função `update`, vai ver que o dado que temos de volta pode ser `Ok ...` ou `Err ...`. Um `Err` pode ocorrer se a requisição HTTP falhar ou se a decodificação falhar.

# Ainda precisamos de JS...

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

A parte importante do nosso HTML/JS é onde inicializamos a app. Na chamada à função `init` nós passamos o valor atualmente guardado no nosso `localStorage`. Dê uma olhada na função `init` do lado do Elm para ver como lidamos com isto.

Depois, usamos o port `sendQuery` para salvar o termo de busca toda vez que uma nova busca ocorrer. Olhe em como lidamos com a mensagem `Search` na função `update` para ver o uso do port `sendQuery` que definimos no início de nosso módulo.

# Aprendizados

Eu não tenho nenhuma experiência real com React ou Ember então esta seção não será tão bem elaborada ou profunda quanto no artigo original. Mas vamos dar uma olhada em como Elm resolve alguns dos nosso problemas de maneira simples e eficientes.

## Custom types são incríveis

Na função `storiesReducer` da implementação em React temos algo parecido com o que a nossa função `update` faz. O problema é que ele usa strings puras como chaves para as possíveis ações a serem executadas. Isso é ok até você precisar de mais mensagens/ações.

Pelo fato de estarmos usando um custom type como nossas mensagens (a gente poderia usar strings mas elas não seriam muito úteis), precisamos lidar com todas as possibilidades de mensagens que existem dentro deste tipo. Se precisarmos de mais mensagens, basta adicioná-las ao tipo `Msg` e o compilador vai educadamente nos avisar de todos os lugares onde precisamos lidar com esta nova mensagem se esquecermos de algo.

## Custom types são incríveis²

Tanto na implementação React quanto Ember você vê que o "model" tem algumas flags como `isLoading` ou `isError`. Tudo o que essas flags fazem é informar o estado dos resultados que estamos tentando carregar. Veja como sempre é necessário resetar estes valores pra não acontecer de termos a informação de erro enquanto carregamos algo ao mesmo tempo. Nada impede isso de realmente acontecer...

Podemos resolver isto com custom types que representam um estado dos resultados por vez. Não é possível termos a situação `Loading` e `Error` ao mesmo tempo, assim temos certeza que nossa view sempre irá renderizar a coisa certa.

## Decodificação de JSON

A gente tem um bug nessa app. O título ou autor de uma história podem ter um valor `null` vindo da chamada da API. Se eu abrir as apps React ou Ember e procurar por algo como "elmish" por exemplo, você vai ver algumas linhas esquisitas. Isso acontece porque JavaScript não vai te impedir de acessar dados que não existem em um objeto, renderizando uma lista confusa e pouco informativa de... coisas.

Isso não pode acontecer com Elm. Além do fato de termos usados tipos alias para informar o compilador sobre a forma das nossas estruturas, quando recebemos dados do mundo exterior ele precisa passar por um processo de decodificação e este processo pode ser bem sucedido ou não: Elm nos força a lidar com ambas as situações ou nosso programa não compila. Procure por "elmish" na versão Elm e você verá a mensagem "Something went wrong..." (Algo de errado aconteceu...). Isto acontece porque nosso decoder só decodifica strings para a chave `title` e se temos um `null` do lado do JSON, ele não consegue decodificar.

Nós poderíamos então atualizar nosso decodificador para lidar com estas situações, talvez fazendo o `title` ser um `Maybe String`, e isto nos forçaria a lidar com o fato de que `title` pode ser tanto `Just ...` quando `Nothing` em nossa função de `view`. Nunca seríamos capazes de reproduzir as linhas confusas e bobas que temos quando usamos "apenas" Javascript.

## Uma abordagem simples

Hooks, components, tracked properties, actions, etc... Aplicações do mundo JS podem ter muitos conceitos que requerem tempo para aprender e dominar. Por outro lado, Elm é super simples. Apesar da sua sintaxe esquisita, se você nunca lidou com algo parecidoa antes, Elm introduz pouquíssimos conceitos: tudo é função, e a forma como a sua aplicação funciona é através de iterações da TEA, só isso.

---

Eu sinto que estou sendo superficial em comparação ao artigo tão bem informado e bem escrito no qual este foi baseado, mas eu espero ter tido algum sucesso em mostrar como Elm solucionaria problemas similares apontando para as coisas animadoras que a linguagem traz à mesa.

O que eu estou esquecendo da minha lista de aprendizados? Existe algum lugar onde as soluções React/Ember sejam melhores? Por favor, mande seus comentários. Até breve!
