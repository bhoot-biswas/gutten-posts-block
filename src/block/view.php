<?php
namespace BengalStudio;

/**
 * Renders the `bengal-studio/latest-posts` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function render_latest_posts( $attributes ) {
	global $post;
	$args = array(
		'posts_per_page'   => $attributes['postsToShow'],
		'post_status'      => 'publish',
		'order'            => $attributes['order'],
		'orderby'          => $attributes['orderBy'],
		'suppress_filters' => false,
	);
	if ( isset( $attributes['categories'] ) ) {
		$args['category'] = $attributes['categories'];
	}
	$recent_posts      = get_posts( $args );
	$list_items_markup = '';
	$excerpt_length    = $attributes['excerptLength'];
	ob_start();
	$class = 'wp-block-latest-posts wp-block-latest-posts__list';
	if ( isset( $attributes['align'] ) ) {
		$class .= ' align' . $attributes['align'];
	}
	if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
		$class .= ' is-grid';
	}
	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
		$class .= ' columns-' . $attributes['columns'];
	}
	if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] ) {
		$class .= ' has-dates';
	}
	if ( isset( $attributes['className'] ) ) {
		$class .= ' ' . $attributes['className'];
	}
	?>
	<ul class="<?php echo esc_attr( $class ); ?>">
		<?php foreach ( $recent_posts as $post ) : ?>
			<?php setup_postdata( $post ); ?>
			<li>
				<?php if ( has_post_thumbnail() && $attributes['displayFeaturedImage'] && $attributes['featuredImageSize'] ) : ?>
					<figure>
						<a class="post-thumbnail" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
							<?php
							the_post_thumbnail(
								$attributes['featuredImageSize'],
								array(
									'alt' => the_title_attribute(
										array(
											'echo' => false,
										)
									),
								)
							);
							?>
						</a>
					</figure>
				<?php endif; ?>
				<div class="entry-body">
					<?php the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' ); ?>
					<div class="entry-meta">
						<?php
						if ( $attributes['showAuthor'] ) :
							if ( $attributes['showAvatar'] ) :
								echo get_avatar( get_the_author_meta( 'ID' ) );
							endif;

							$byline = sprintf(
								/* translators: %s: post author. */
								esc_html_x( 'by %s', 'post author', '_s' ),
								'<span class="author vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '">' . esc_html( get_the_author() ) . '</a></span>'
							);
							echo '<span class="byline"> ' . $byline . '</span>'; // WPCS: XSS OK.
						endif;

						if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] ) :
							$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
							if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
								$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
							}
							$time_string = sprintf(
								$time_string,
								esc_attr( get_the_date( DATE_W3C ) ),
								esc_html( get_the_date() ),
								esc_attr( get_the_modified_date( DATE_W3C ) ),
								esc_html( get_the_modified_date() )
							);
							$posted_on   = sprintf(
								/* translators: %s: post date. */
								esc_html_x( 'Posted on %s', 'post date', '_s' ),
								'<a href="' . esc_url( get_permalink() ) . '" rel="bookmark">' . $time_string . '</a>'
							);

							echo '<span class="posted-on">' . $posted_on . '</span>'; // WPCS: XSS OK.
						endif;
						?>
					</div>

					<?php
					if ( isset( $attributes['displayPostContent'] ) && $attributes['displayPostContent'] && isset( $attributes['displayPostContentRadio'] ) && 'excerpt' === $attributes['displayPostContentRadio'] ) :
						$post_excerpt = $post->post_excerpt;
						if ( ! ( $post_excerpt ) ) {
							$post_excerpt = $post->post_content;
						}

						$trimmed_excerpt = esc_html( wp_trim_words( $post_excerpt, $excerpt_length, ' &hellip; ' ) );
						?>
						<div class="wp-block-latest-posts__post-excerpt">
							<?php echo $trimmed_excerpt; ?>
							<?php if ( strpos( $trimmed_excerpt, ' &hellip; ' ) !== false ) : ?>
								<a href="<?php the_permalink(); ?>"><?php echo __( 'Read more' ); ?></a>
							<?php endif; ?>
						</div>
						<?php
					endif;
					?>

					<?php if ( isset( $attributes['displayPostContent'] ) && $attributes['displayPostContent'] && isset( $attributes['displayPostContentRadio'] ) && 'full_post' === $attributes['displayPostContentRadio'] ) : ?>
						<div class="wp-block-latest-posts__post-full-content">
							<?php
							the_content(
								sprintf(
									wp_kses(
										/* translators: %s: Name of current post. Only visible to screen readers */
										__( 'Continue reading<span class="screen-reader-text"> "%s"</span>', '_s' ),
										array(
											'span' => array(
												'class' => array(),
											),
										)
									),
									get_the_title()
								)
							);
							?>
						</div>
					<?php endif; ?>
				</div>
			</li>
		<?php endforeach; ?>
	</ul>
	<?php
	return ob_get_clean();
}
