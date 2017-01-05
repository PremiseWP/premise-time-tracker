<?php
/**
 * Display the options needed for the Time Tracker Meta Box
 *
 * @package Premise Time Tracker\Model
 */


/**
* The premise time tracker meta box class
*
* Prints our meta boxes on the premise time tracker custom post type only
*/
class PTT_Meta_Box {

	/**
	 * Plugin instance.
	 *
	 * @see get_instance()
	 * @var object
	 */
	protected static $instance = NULL;


	/**
	 * holds nonce action
	 *
	 * @var string
	 */
	protected $nonce = 'ptt_meta_box';


	/**
	 * Holds post type name
	 *
	 * @var string
	 */
	public $post_type = 'premise_time_tracker';


	/**
	 * Constructor. Intentionally left empty and public.
	 *
	 * @see 	pboxes_setup()
	 * @since 	1.0
	 */
	public function __construct() {}


	/**
	 * Access this plugin’s working instance
	 *
	 * @since   1.0
	 * @return  object of this class
	 */
	public static function get_instance() {
		NULL === self::$instance and self::$instance = new self;

		return self::$instance;
	}


	/**
	 * Register our meta box and hooks save action
	 *
	 * @return Does not return any values
	 */
	public function hook_box() {
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'save_post',      array( $this, 'do_save'         ) );
	}


	/**
	 * Check for the post type and diplay the mb pnly if on premise_time_tracker post type
	 *
	 * @param string $post_type current post type
	 */
	public function add_meta_box( $post_type ) {
		if ( $this->post_type == $post_type ) {
			add_meta_box( 'premise_time_tracker', 'Timer', array( $this, 'timer_metabox' ), $this->post_type, 'side', 'high' );
		}
	}


	/**
	 * display the timer UI
	 *
	 * @return string html for the timer
	 */
	public function timer_metabox() {
		wp_nonce_field( $this->nonce, 'ptt_nonce_field' );

		premise_field( 'text', array(
			'name'        => 'pwptt_timer[time]',
			'label'       => 'Enter Time',
			'placeholder' => '1.75',
			'tooltip'     => 'Enter in 15 minute increments (15 minutes = 0.25). The example \'1.75\' would equal 1 hour and 45 minutes.',
			'context'     => 'post',
		) );

		// You cannot pass serialized data to the restful api
		// so we will have to integrate this field for entering time.
		// for now, lets test the restful api project (chrome extension)
		// to fill out this field 'pwptt_hours'. Once we get it working
		// we can figure out how to integrate it.
		premise_field( 'text', array(
			'name'        => 'pwptt_hours',
			'context'     => 'post',
		) );
	}


	/**
	 * save the timer
	 *
	 * @param  int    $post_id the post id for the post being used
	 * @return mixed           the post id if fails. Otherwise nothing
	 */
	public function do_save( $post_id ) {

		// Check if our nonce is set.
		if ( ! isset( $_POST['ptt_nonce_field'] ) ) {
			return $post_id;
		}

		$nonce = $_POST['ptt_nonce_field'];

		// Verify that the nonce is valid.
		if ( ! wp_verify_nonce( $nonce, $this->nonce ) ) {
			return $post_id;
		}

		/*
		 * If this is an autosave, our form has not been submitted,
		 * so we don't want to do anything.
		 */
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}

		// Check the user's permissions.
		if ( 'premise_time_tracker' !== $_POST['post_type'] ) {
			return $post_id;
		}

		/* OK, it's safe for us to save the data now. */

		// Sanitize the user input.
		$mydata = array_map( 'sanitize_text_field', $_POST['pwptt_timer'] );

		// Sanitize the user input.
		$pwptt_hours = sanitize_text_field( $_POST['pwptt_hours'] );

		// Update the meta field.
		update_post_meta( $post_id, 'pwptt_timer', $mydata );

		update_post_meta( $post_id, 'pwptt_hours', $pwptt_hours );
	}
}
