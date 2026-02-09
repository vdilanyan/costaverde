<?php
/**
 * Template Name: Thank You page
 */

use Timber\Timber;

$context = Timber::get_context();

if (have_posts()) {
    the_post();

    $context = array_merge($context, [
        'title' => get_the_title(),
        'content' => apply_filters('the_content', get_the_content()),
    ]);
}

Timber::render('templates/thank-you.twig', $context);
