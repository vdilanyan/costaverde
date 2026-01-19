<?php
add_theme_support('post-thumbnails');
add_image_size('blog-thumb', 200, 200, true);

function add_open_graph_meta_tags(): void
{
    if (!is_404()) {
        global $post;

        $custom_image_url = get_stylesheet_directory_uri() . '/assets/img/logo.jpg';
        $publish_date = get_the_date(DATE_W3C, $post->ID); ?>

        <meta property="og:title" content="<?php echo esc_attr(get_the_title($post->ID)); ?>" />
        <meta property="og:description" content="<?php echo esc_attr("description"); ?>" />
        <meta property="og:url" content="<?php echo esc_url(get_permalink($post->ID)); ?>" />
        <meta property="og:image" content="<?php echo esc_url($custom_image_url); ?>" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="<?php bloginfo('name'); ?>" />
        <meta property="article:published_time" content="<?php echo esc_attr($publish_date); ?>" /> <?php
    }
}

add_action('wp_head', 'add_open_graph_meta_tags');
