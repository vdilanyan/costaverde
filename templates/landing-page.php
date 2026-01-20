<?php
/**
 * Template Name: Landing page
 */

use Timber\Timber;

$context = Timber::get_context();

$context = array_merge($context, [
    'hero' => [
        'heading' => get_field('heading'),
        'description' => get_field('description'),
        'button_label' => get_field('consultation_button_label'),
        'images' => get_field('images'),
    ],
    'why_us' => [
        'heading' => get_field('vp_heading'),
        'description' => get_field('vp_description'),
        'cards' => get_field('cards'),
    ],
    'testimonials' => [
        'heading' => get_field('testimonials_heading'),
        'background_image' => get_field('background_image'),
        'total_score' => get_field('total_score'),
        'testimonials' => get_field('testimonials'),
    ],
]);

Timber::render('templates/landing-page.twig', $context);
