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
}
add_action('wp_enqueue_scripts', 'enqueue_assets');
