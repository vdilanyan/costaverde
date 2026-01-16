<?php

use Timber\Timber;

$context = Timber::get_context();

$context = array_merge($context, [
]);

Timber::render('front-page.twig', $context);
