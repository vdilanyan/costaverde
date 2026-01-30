<?php
function enqueue_assets(): void {
    wp_enqueue_style('stylecss', get_stylesheet_uri());
    wp_enqueue_script(
        'functions',
        get_template_directory_uri() . '/assets/js/functions.js',
        '',
        '',
        true
    );
    wp_enqueue_script(
        'lightbox',
        get_template_directory_uri() . '/assets/js/lightbox.js',
        '',
        '',
        true
    );

    $gallery = get_field('gallery', get_queried_object_id());

    wp_localize_script('lightbox', 'wp_var',
        [
            'gallery' => json_encode($gallery),
        ]
    );
}
add_action('wp_enqueue_scripts', 'enqueue_assets');
