+++
title = "Elixir para desenvolvedores PHP - Paradigma de programação"
description = "Elixir para desenvolvedores PHP - Paradigma de programação - Parte I"
date = 2019-10-01
[taxonomies]
tags = ["elixir", "php", "iniciantes", "funcional"]
[extra]
author = "Éber F. Dias"
base_path = "@/blog/elixir-for-php-developers-programming-paradigm.md"
+++
Quando quero aprender algo novo tento achar algum material comparando o que quero aprender com algo que eu já conheça. Assim posso medir os pros e contras e decidir se devo investir meu tempo nisso.

Eu venho do mundo do PHP e me apaixonei por Elixir então minha ideia aqui é comparar alguns aspectos destas linguagens e mostrar como elas são diferentes (ou similares) e talvez te ajudar a tomar a decisão de aprender mais sobre ela. Espero te mostrar que Elixir é uma linguagem divertida de se trabalhar!

Aliás, sou iniciante no mundo Elixir. Esta é a perspectiva de alguém escrevendo enquanto aprende a linguagem então leve isto em consideração.

## Elixir é uma linguagem funcional

A primeira grande diferença entre PHP e Elixir é que Elixir é uma linguagem funcional pura. PHP, no entanto, é uma linguagem multi-paradigma, onde você pode resolver problemas usando diferentes paradigmas embora POO (programação orientada a objetos) seja bem dominante hoje em dia.

E o que FP (functional programming ou programação funcional) significa? A teoria pode ficar bem pesada e talvez você queira ler o artigo na [Wikipedia](https://en.wikipedia.org/wiki/Functional_programming) para uma descrição mais elaborada, mas em resumo e para os propósitos desta comparação, significa que **não existem objetos**.

Um objeto em POO é (além de outras coisas) quando você junta dados e funcionalidades: no mesmo objeto você tem o estado e os métodos para afetar este estado.

Mas em FP estas coisas são separadas e tudo o que você tem são funções que manipulam dados. Vamos dar uma olhada em como isso se parece:

```php
<?php

class User extends DataLayer
{
  private $name;
  private $email;

  public function __construct(string $name, string $email)
  {
    $this->name = $name;
    $this->email = $email;
  }
}

$user = new User('John Doe', 'john.doe@example.com');

$user->save();
```

O equivalente em Elixir do código anterior seria algo mais ou menos assim:

```elixir
defmodule User do
  defstruct name: nil, email: nil

  def save(%User{} = user) do
    Repo.insert(user)
  end
end

%User{name: "John Doe", email: "john.doe@example.com"}
|> User.save()
```

Existe muita coisa acontecendo aqui. A sintaxe é um pouco alien se comparada à do PHP. Sem colchetes, e o que é aquela atribuição na definição da função? Bem, chegaremos lá mas só pra esclarecer, aquilo **não é** uma atribuição.

O que fizemos aqui foi criar uma `struct` que é um `map` glorificado. Um `map` é similar a um array associativo em PHP onde você tem chaves e valores. A diferença entre um `map` e uma `struct` é que com a `struct` você pode estruturar como seus dados devem se parecer, definindo chaves específicas e até mesmo valores padrão (você pode estar pensando agora "uhm, isso parece um objeto" mas **não é**, são apenas dados).

Outra coisa que você deve ter percebido é que não temos nenhum tipo de herança. No código PHP fica pressuposto que o método `save` vem da classe `DataLayer` da qual a nossa classe `User` extende mas no código Elixir a função `save` está apenas chamando uma outra função de um outro módulo (`Repo` neste caso) para persistir os dados no nosso banco.

Em FP você tem dados e funções por todos os lados e seu trabalho é **compor** estas coisas para criar outras coisas maiores que também podem compor outras coisas.

## Mas PHP também tem funções...

O código Elixir também poderia ser traduzido para PHP mais ou menos assim:

```php
<?php

function save(array $user): bool
{
  DataLayer::persist($user);
}

$user = ['name' => 'John Doe', 'email' => 'john.doe@example.com'];
save($user);
```

Então PHP pode ser funcional certo? Bom, certo... Eu acho? Como disse no início, Elixir é uma linguagem funcional **pura**. Isso siginifica que não existem "atalhos" pra fora deste mundo quando usamos Elixir.

Em PHP você pode desenvolver usando um "estilo funcional" mas nunca será funcional de verdade. Você pode ficar "preguiçoso" e apenas tirar vantagem da natureza multi-paradigma da linguagem para resolver alguns problemas e, na realidade, seria melhor assim pois PHP não é uma linguagem funcional.

E FP não se caracteriza apenas pela ausência de objetos. Se você teve a curiosidade de ler aquele artigo da Wikipedia viu que este paradigma inclui outras coisas como:

- Funções de primeira classe
- Funções totais
- Funções puras
- Imutabilidade
- Recursão
- Uso pesado de ~~drogas~~ teorias matemáticas

E muitas outras coisas...

Algumas destas coisas podem até aparecer em PHP. Funções de primeira classe entraram na linguagem com closures na versão 5.3. Outras você definitivamente não terá como **imutabilidade** que é um aspecto gigantesco de FP.

## E como isto é melhor?

Agora você já tem alguma ideia do que é FP e como ela se difere de POO mas ela é melhor? Sim e não. Algumas pessoas vão dizer que cada paradigma tem seu lugar no mundo e estão tentando resolver problemas diferentes, mas no final das contas, FP oferece uma forma diferente de se olhar para programação.

Ao invés de pensar em objetos, seus atributos e métodos, você pensa apenas em dados e em como transformá-los com funções. É uma perspectiva mais simples mas muito poderosa.

Sem fortes padrões e consistência, programas OO podem rapidamente se tornar insustentáveis. Com FP você pode evitar muitas destas armadilhas escrevendo um código mais simples, que é mais fácil de escrever e refatorar. Não me entanda mal, você ainda pode estragar tudo usando FP mas alguns dos problemas mais comuns na arquitetura de programas com OO simplesmente não existem em FP.

Existem inúmeros artigos por aí que vão te mostrar como FP pode ser um paradigma forte e eu sugiro que você dê uma olhada. Sei que existem muitas pontas soltas neste artigo mas eu estou apenas tentando fazer uma intrudução interessante. A ideia é mergulhar mais fundo em alguns destes conceitos em artigos futuros.

Me avise se você estiver interessado em algum assunto específico. Eu posso falar sobre ele num próximo artigo.

Obrigado pela leitura!
