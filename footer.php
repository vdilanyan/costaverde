        </main><?php
        use Timber\Timber;

        global $post;

        $args = [
            'parent' => $post->ID,
            'post_type' => 'page',
            'post_status' => 'publish',
            'posts_per_page' => -1,
        ];

        $child_pages = get_pages($args);

        $context = Timber::get_context();
        $phone_number = get_field('phone_number', 'option');

        $formatted = preg_replace('/(\d{3})(\d{3})(\d{4})/', '$1-$2-$3', $phone_number);

        $context['phone_number'] = get_field('phone_number', 'option');
        $context['formatted_phone_number'] = $formatted;
        $context['address'] = get_field('address', 'option');
        $context['child_pages'] = $child_pages;

        Timber::render('layout/footer.twig', $context);

        wp_footer(); ?>
        this is the footer
    </body>
</html>
