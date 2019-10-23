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
	SelectControl,
	Path,
	SVG,
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
const featuredImageSizes = [
	{ value: 'thumbnail', label: __( 'Thumbnail' ) },
	{ value: 'medium', label: __( 'Medium' ) },
	{ value: 'large', label: __( 'Large' ) },
	{ value: 'full', label: __( 'Full' ) },
]

const coverIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" />
	</SVG>
);

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
			showAuthor,
			showAvatar,
			displayFeaturedImage,
			featuredImageSize,
			featuredImagePosition,
			postLayout,
			columns,
			order,
			orderBy,
			categories,
			postsToShow,
			excerptLength
		} = attributes;

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Post Content Settings' ) }>
					<ToggleControl
						label={ __( 'Post Content' ) }
						checked={ displayPostContent }
						onChange={ ( value ) => setAttributes( { displayPostContent: value } ) }
					/>
					<ToggleControl
						label={ __( 'Display Featured Image' ) }
						checked={ displayFeaturedImage }
						onChange={ displayFeaturedImage => setAttributes( { displayFeaturedImage } ) }
					/>
					{ displayFeaturedImage &&
						<SelectControl
							label={ __( 'Featured Image Size' ) }
							options={ featuredImageSizes }
							value={ featuredImageSize }
							onChange={ featuredImageSize => setAttributes( { featuredImageSize } ) }
						/>
					}
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
					<ToggleControl
						label={ __( 'Show Author' ) }
						checked={ showAuthor }
						onChange={ ( value ) => setAttributes( { showAuthor: value } ) }
					/>
					{ showAuthor && (
						<ToggleControl
							label={ __( 'Show Author Avatar' ) }
							checked={ showAvatar }
							onChange={ ( value ) => setAttributes( { showAvatar: value } ) }
						/>
					) }
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
		);

		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;
		if ( ! hasPosts ) {
			return (
				<Fragment>
					{ inspectorControls }
					<Placeholder
						icon="admin-post"
						label={ __( 'Latest Posts' ) }
					>
						{ ! Array.isArray( latestPosts ) ?
							<Spinner /> :
							__( 'No posts found.' )
						}
					</Placeholder>
				</Fragment>
			);
		}

		// Removing posts from display should be instant.
		const displayPosts = latestPosts.length > postsToShow ?
			latestPosts.slice( 0, postsToShow ) :
			latestPosts;

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

		const featuredImagePositionControls = [
			{
				icon: 'align-none',
				title: __( 'Show media on top', 'newspack-blocks' ),
				isActive: featuredImagePosition === 'top',
				onClick: () => setAttributes( { featuredImagePosition: 'top' } ),
			},
			{
				icon: 'align-pull-left',
				title: __( 'Show media on left', 'newspack-blocks' ),
				isActive: featuredImagePosition === 'left',
				onClick: () => setAttributes( { featuredImagePosition: 'left' } ),
			},
			{
				icon: 'align-pull-right',
				title: __( 'Show media on right', 'newspack-blocks' ),
				isActive: featuredImagePosition === 'right',
				onClick: () => setAttributes( { featuredImagePosition: 'right' } ),
			},
			{
				icon: coverIcon,
				title: __( 'Show media behind', 'newspack-blocks' ),
				isActive: featuredImagePosition === 'behind',
				onClick: () => setAttributes( { featuredImagePosition: 'behind' } ),
			},
		];

		const dateFormat = __experimentalGetSettings().formats.date;

		const renderPost = ( post, i ) => {
			const titleTrimmed = post.title.rendered.trim();
			let excerpt = post.excerpt.rendered;
			if ( post.excerpt.raw === '' ) {
				excerpt = post.content.raw;
			}
			const excerptElement = document.createElement( 'div' );
			excerptElement.innerHTML = excerpt;
			excerpt = excerptElement.textContent || excerptElement.innerText || '';
			const featuredImageSrc = ( post.featured_image_src[ featuredImageSize ] || [] )[ 0 ];

			return (
				<li key={ i } className={ featuredImageSrc && 'post-has-image' }>
					{ displayFeaturedImage && featuredImageSrc && (
						<figure className="post-thumbnail">
							<a href={ post.link } target="_blank">
								<img src={ featuredImageSrc } alt={ __( 'featured' ) } />
							</a>
						</figure>
					) }
					<div className="entry-body">
						<h2 className="entry-title">
							<a href={ post.link } target="_blank" rel="noreferrer noopener">
								{ titleTrimmed ? (
									<RawHTML>
										{ titleTrimmed }
									</RawHTML>
								) :
									__( '(no title)' )
								}
							</a>
						</h2>
						<div className="entry-meta">
							{ showAuthor && post.author_info.avatar && showAvatar && (
								<span className="avatar author-avatar" key="author-avatar">
									<RawHTML>{ post.author_info.avatar }</RawHTML>
								</span>
							) }

							{ showAuthor && (
								<span className="byline">
									{ __( 'by' ) }{' '}
									<span className="author vcard">
										<a className="url fn n" href="#">
											{ post.author_info.display_name }
										</a>
									</span>
								</span>
							) }
							{ displayPostDate && post.date_gmt && (
								<time dateTime={ format( 'c', post.date_gmt ) } className="wp-block-latest-posts__post-date entry-date published" key="pub-date">
									{ dateI18n( dateFormat, post.date_gmt ) }
								</time>
							) }
						</div>
						{ displayPostContent && displayPostContentRadio === 'excerpt' &&
							<div className="wp-block-latest-posts__post-excerpt">
								<RawHTML
									key="html"
								>
									{ excerptLength < excerpt.trim().split( ' ' ).length ?
										excerpt.trim().split( ' ', excerptLength ).join( ' ' ) + ' ... <a href=' + post.link + 'target="_blank" rel="noopener noreferrer">' + __( 'Read more' ) + '</a>' :
										excerpt.trim().split( ' ', excerptLength ).join( ' ' ) }
								</RawHTML>
							</div>
						}
						{ displayPostContent && displayPostContentRadio === 'full_post' &&
							<div className="wp-block-latest-posts__post-full-content">
								<RawHTML
									key="html"
								>
									{ post.content.raw.trim() }
								</RawHTML>
							</div>
						}
					</div>
				</li>
			);
		}

		return (
			<Fragment>
				{ inspectorControls }
				<BlockControls>
					<Toolbar controls={ layoutControls } />
					{ displayFeaturedImage && <Toolbar controls={ featuredImagePositionControls } /> }
				</BlockControls>
				<ul
					className={ classnames( this.props.className, {
						'wp-block-latest-posts__list': true,
						'is-grid': postLayout === 'grid',
						'has-dates': displayPostDate,
						[ `image-align${ featuredImagePosition }` ]: displayFeaturedImage,
						[ `columns-${ columns }` ]: postLayout === 'grid',
					} ) }
				>
					{ displayPosts.map( ( post, i ) => renderPost( post, i ) ) }
				</ul>
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
