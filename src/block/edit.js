/**
 * External dependencies
 */
import {
	isUndefined,
	pickBy
} from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	Component,
	RawHTML,
	Fragment,
} from '@wordpress/element';
import {
	PanelBody,
	Placeholder,
	QueryControls,
	RangeControl,
	Spinner,
	ToggleControl,
	Toolbar,
	RadioControl,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import {
	addQueryArgs
} from '@wordpress/url';
import {
	__
} from '@wordpress/i18n';
import {
	dateI18n,
	format,
	__experimentalGetSettings
} from '@wordpress/date';
import {
	InspectorControls,
	BlockControls,
} from '@wordpress/block-editor';
import {
	withSelect
} from '@wordpress/data';

/**
 * Module Constants
 */
const CATEGORIES_LIST_QUERY = {
	per_page: -1,
};
const MAX_POSTS_COLUMNS = 6;

class LatestPostsEdit extends Component {
	constructor() {
		super(...arguments);
		this.state = {
			categoriesList: [],
		};
	}

	componentDidMount() {
		this.isStillMounted = true;
		this.fetchRequest = apiFetch({
			path: addQueryArgs(`/wp/v2/categories`, CATEGORIES_LIST_QUERY),
		}).then(
			(categoriesList) => {
				if (this.isStillMounted) {
					this.setState({
						categoriesList
					});
				}
			}
		).catch(
			() => {
				if (this.isStillMounted) {
					this.setState({
						categoriesList: []
					});
				}
			}
		);
	}

	componentWillUnmount() {
		this.isStillMounted = false;
	}

	render() {
		const {
			attributes,
			setAttributes,
			latestPosts
		} = this.props;
		const {
			categoriesList
		} = this.state;
		const {
			displayPostContentRadio,
			displayPostContent,
			displayPostDate,
			postLayout,
			columns,
			order,
			orderBy,
			categories,
			postsToShow,
			excerptLength
		} = attributes;

		const layoutControls = [
			{
				icon: 'list-view',
				title: __( 'List view' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
			{
				icon: 'grid-view',
				title: __( 'Grid view' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
		];

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Post Content Settings' ) }>
						<ToggleControl
							label={ __( 'Post Content' ) }
							checked={ displayPostContent }
							onChange={ ( value ) => setAttributes( { displayPostContent: value } ) }
						/>
						{ displayPostContent &&
						<RadioControl
							label="Show:"
							selected={ displayPostContentRadio }
							options={ [
								{ label: 'Excerpt', value: 'excerpt' },
								{ label: 'Full Post', value: 'full_post' },
							] }
							onChange={ ( value ) => setAttributes( { displayPostContentRadio: value } ) }
						/>
						}
						{ displayPostContent && displayPostContentRadio === 'excerpt' &&
							<RangeControl
								label={ __( 'Max number of words in excerpt' ) }
								value={ excerptLength }
								onChange={ ( value ) => setAttributes( { excerptLength: value } ) }
								min={ 10 }
								max={ 100 }
							/>
						}
					</PanelBody>

					<PanelBody title={ __( 'Post Meta Settings' ) }>
						<ToggleControl
							label={ __( 'Display post date' ) }
							checked={ displayPostDate }
							onChange={ ( value ) => setAttributes( { displayPostDate: value } ) }
						/>
					</PanelBody>

					<PanelBody title={ __( 'Sorting and Filtering' ) }>
						<QueryControls
							{ ...{ order, orderBy } }
							numberOfItems={ postsToShow }
							categoriesList={ categoriesList }
							selectedCategoryId={ categories }
							onOrderChange={ ( value ) => setAttributes( { order: value } ) }
							onOrderByChange={ ( value ) => setAttributes( { orderBy: value } ) }
							onCategoryChange={ ( value ) => setAttributes( { categories: '' !== value ? value : undefined } ) }
							onNumberOfItemsChange={ ( value ) => setAttributes( { postsToShow: value } ) }
						/>
						{ postLayout === 'grid' &&
							<RangeControl
								label={ __( 'Columns' ) }
								value={ columns }
								onChange={ ( value ) => setAttributes( { columns: value } ) }
								min={ 2 }
								max={ ! hasPosts ? MAX_POSTS_COLUMNS : Math.min( MAX_POSTS_COLUMNS, latestPosts.length ) }
								required
							/>
						}
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					<Toolbar controls={ layoutControls } />
				</BlockControls>
				<div className={ this.props.className }>
					<p>— Hello from the backend.</p>
					<p>
						CGB BLOCK: <code>gutten-posts-block</code> is a new Gutenberg block
					</p>
					<p>
						It was created via{ ' ' }
						<code>
							<a href="https://github.com/ahmadawais/create-guten-block">
								create-guten-block
							</a>
						</code>.
					</p>
				</div>
			</Fragment>
		);

	}
}

export default withSelect((select, props) => {
	const {
		postsToShow,
		order,
		orderBy,
		categories
	} = props.attributes;
	const {
		getEntityRecords
	} = select('core');
	const latestPostsQuery = pickBy({
		categories,
		order,
		orderby: orderBy,
		per_page: postsToShow,
	}, (value) => !isUndefined(value));
	return {
		latestPosts: getEntityRecords('postType', 'post', latestPostsQuery),
	};
})(LatestPostsEdit);
