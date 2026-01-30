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
    'how_it_works' => [
        'heading' => get_field('hiw_heading'),
        'steps' => get_field('hiw_steps'),
        'footnote' => get_field('hiw_footnote'),
        'form_title' => get_field('form_title'),
    ],
    'services' => [
        'heading' => get_field('services_heading'),
        'description' => get_field('services_description'),
        'services_list_title' => get_field('services_list_title'),
        'services' => get_field('services'),
    ],
    'cta' => [
        'heading' => get_field('cta_heading'),
        'description' => get_field('cta_description'),
        'background_image' => get_field('cta_background_image'),
        'first_cta_link' => get_field('first_cta_link'),
        'second_cta_link' => get_field('second_cta_link'),
    ],
    'about_us' => [
        'sections' => get_field('sections'),
    ],
    'projects' => [
        'heading' => get_field('projects_heading'),
        'gallery' => get_field('gallery'),
    ],
    'contact_us' => [
        'heading' => get_field('contact_us_heading'),
        'description' => get_field('contact_us_description'),
        'button_label' => get_field('contact_us_consultation_button_label'),
        'background_image' => get_field('contact_us_background_image'),
    ],
]);

Timber::render('templates/landing-page.twig', $context);
