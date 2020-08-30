+++
title = "Elixir for PHP developers - Programming paradigm"
description = "Elixir for PHP developers - Programming paradigm - Part I"
date = 2019-10-01
+++
When I want to learn something new I try to find some kind of material comparing it to something that I already know so I can see the pros and cons and decide if I should invest my time on it.

I come from the PHP world and fell in love with Elixir so my idea here is to compare some aspects of those languages and show how they are different (or similar) and maybe help you make a decision to learn more about it. I hope you will find that Elixir is a super fun language to work with!

By the way, I'm a beginner in the Elixir world. This is the perspective from someone learning it as we go so take that into account.

## Elixir is a functional programming language

The first big difference between PHP and Elixir is that Elixir is a pure FP (functional programming) language. PHP, on the other hand, is a multi-paradigm language, where you can solve problems using different paradigms even though OOP (object-oriented programming) is pretty dominant these days.

And what does FP means? The theory can get really dense, and you might wanna check the [Wikipedia](https://en.wikipedia.org/wiki/Functional_programming) article for a more elaborated description, but in a nutshell and for the purposes of this comparison, it means there are **no objects**.

An object in OOP is (among other things) when you bundle data and functionality together: on the same object, you have the state and the methods to affect that state.

But in functional programming, those are separated things and all you get are functions that manipulate data. Let's take a look at how that looks like:

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

The somewhat equivalent of that code in Elixir looks like this:

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

There is a lot going on here. The syntax is kinda alien compared to the PHP counterpart. No brackets, and what is that assignment on the function definition? Well, we will get there but just to clarify, that is **not** an assignment.

What we did here was to create a `struct` which is a glorified `map`. A `map` is similar to an associative array in PHP where you have keys and values. The difference between a `map` and a `struct` is that with the `struct` you can **struct**ure how the data will look like, defining keys and even default values (you might be thinking "uhm, that looks like an object" but **it is not**, it is just data).

Another thing you might have noticed is that we don't have any kind of inheritance. In the PHP code, it is assumed that the `save` method comes from the `DataLayer` class from which the `User` class extends but in the Elixir code the `save` function is just calling another function from another module (`Repo` being the module) to persist the data to the database.

In FP you have data and functions all the way down and your work is to **compose** those things to make bigger things that can also be composed onto other things.

## But PHP also has functions...

The Elixir code could be roughly translated to PHP like:

```php
<?php

function save(array $user): bool
{
  DataLayer::persist($user);
}

$user = ['name' => 'John Doe', 'email' => 'john.doe@example.com'];
save($user);
```

So PHP can do FP right? Well, right... I guess? Like I said at the beginning, Elixir is a **pure** FP language. That means that there are no "escape hatches" from the FP world when using Elixir.

In PHP you can certainly try to use a "functional style" of code but it will never be real FP. You might get "lazy" and just take advantage of the multi-paradigm nature of the language to solve some problems in other ways and in fact, that would be easier in PHP because it is not an FP language.

Also, FP is not only defined by the lack of objects. If you were curious enough to take a look at that Wikipedia article you might have seen that the FP paradigm includes other things like:

- First-class functions
- Total functions
- Pure functions
- Data immutability
- Recursion
- Heavy use of ~~drugs~~ mathematical theory

Among many other things...

Some of that you might even have in PHP. First-class functions entered the language with closures on version 5.3. Other things you definitely won't have like **data immutability** which is a huge aspect of FP.

## And how is it any better?

Now you have a rough idea of what FP is and how it is different from OOP but is it any better than OOP? Yes and no. Some people might claim that each paradigm has its place in the programming world trying to solve different problems but at the end of the day, FP is just a different way to look at programming.

Instead of thinking about objects and their attributes and methods, you only think about data and how to transform that data with functions. It is a simpler outlook but a very powerful one.

Without strong patterns and consistency OO programs can quickly become unmaintainable. With FP you can avoid a lot of those pitfalls writing simpler code that is easier to write and refactor. Don't get me wrong, you can still screw up writing FP but some common problems in the way you architect programs with OOP are non-existent in FP.

There are a lot of articles out there that will show you how FP can be a strong paradigm and I suggest you take a look. I know there are a lot of loose ends in this article but I'm just trying to make an interesting introduction. The idea is to dive deeper on some of these concepts in future articles.

Let me know if you are interested in a specific subject and how that compares to PHP. I might talk about it in my next article.

Thanks for reading!
