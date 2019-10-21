<?php

namespace BengalStudio;

class Posts_Block_API {

	/**
	 * Register Newspack REST fields.
	 */
	public static function register_rest_fields() {
		register_rest_field(
			array( 'post', 'page' ),
			'featured_image_src',
			array(
				'get_callback'    => array( __NAMESPACE__ . '\Posts_Block_API', 'get_featured_image_src' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);

		register_rest_field(
			'post',
			'author_info',
			array(
				'get_callback'    => array( __NAMESPACE__ . '\Posts_Block_API', 'get_author_info' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);
	}

	/**
	 * Get thumbnail featured image source for the rest field.
	 * @param  [type] $object [description]
	 * @return [type]         [description]
	 */
	public static function get_featured_image_src( $object ) {
		if ( 0 === $object['featured_media'] ) {
			return;
		}

		// Get the featured image.
		$image = wp_get_attachment_image_src( $object['featured_media'], 'full', false );

		// Return featured image urls.
		return [
			'thumbnail' => is_array( $image ) ? wp_get_attachment_image_src( $object['featured_media'], 'thumbnail', false ) : '',
			'medium'    => is_array( $image ) ? wp_get_attachment_image_src( $object['featured_media'], 'medium', false ) : '',
			'large'     => is_array( $image ) ? wp_get_attachment_image_src( $object['featured_media'], 'large', false ) : '',
			'full'      => is_array( $image ) ? $image : '',
		];
	}

	/**
	 * Get author info for the rest field.
	 * @param  [type] $object [description]
	 * @return [type]         [description]
	 */
	public static function get_author_info( $object ) {
		$author_data = array(
			/* Get the author name */
			'display_name' => get_the_author_meta( 'display_name', $object['author'] ),
			/* Get the author link */
			'author_link'  => get_author_posts_url( $object['author'] ),
			/* Get the author avatar */
			'avatar'       => get_avatar( $object['author'], 48 ),
		);

		/* Return the author data */
		return $author_data;
	}
}

add_action( 'rest_api_init', array( __NAMESPACE__ . '\Posts_Block_API', 'register_rest_fields' ) );
