        </main><?php
        use Timber\Timber;

        $context = Timber::get_context();

        Timber::render('layout/footer.twig', $context);

        wp_footer(); ?>
    </body>
</html>
