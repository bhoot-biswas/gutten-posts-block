<?php

namespace BengalStudio;

class Posts_Block_API {

    /**
	 * Register Newspack REST fields.
	 */
    public static function register_rest_fields() {

    }
}

add_action( 'rest_api_init', array( 'Posts_Block_API', 'register_rest_fields' ) );
