<?php

use Timber\Timber;

$context = Timber::get_context();

Timber::render('pages/404.twig', $context);
