/**
 * WordPress dependencies
 */
import { InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, RadioControl, Placeholder } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import UploadPlaceholder from './upload-placeholder';
import useDebounce from './use-debounce';

/* global juxtapose */

const edit = ( { attributes, clientId, isSelected, setAttributes } ) => {
	const {
		imageBeforeId,
		imageBeforeUrl,
		imageBeforeAlt,
		imageAfterId,
		imageAfterUrl,
		imageAfterAlt,
		caption,
		orientation,
	} = attributes;

	// If both images are set, add juxtaspose class, which is picked up by the library.
	const classes = ( imageBeforeUrl && imageAfterUrl ) ? 'image-compare__comparison juxtapose' : 'image-compare__placeholder';

	// Let's look for resize so we can trigger the thing
	const [ resizeListener, sizes ] = useResizeObserver();

	useDebounce( (sz) => {
		if ( sz > 0 ) {
			if ( ( typeof juxtapose !== "undefined" ) && juxtapose.sliders ) {
				// only update for *this* slide
				juxtapose.sliders.forEach( elem => {
					const parentElem = elem.wrapper.parentElement;
					if ( parentElem.id === clientId ) {
						elem.optimizeWrapper(sz);
					}
				} );
			}
		}
	}, 200, sizes.width );

	return (
		<figure className="wp-block-jetpack-image-compare-block" id={ clientId }>
			{ resizeListener }
			<InspectorControls key="controls">
				<PanelBody title={ __( 'Orientation' ) }>
					<RadioControl
						selected={ orientation || 'horizontal' }
						options={ [
							{ label: __( 'Side by side' ), value: 'horizontal' },
							{ label: __( 'Above and below' ), value: 'vertical' },
						] }
						onChange={ ( value ) => {
							setAttributes( {
								orientation: value,
							} );

							// Set a delay so markup can be updated before scan page gets triggered.
							setTimeout( function() {
								juxtapose.scanPage();
							}, 100 );
						} }
					/>
				</PanelBody>
			</InspectorControls>
			<div
				className={ classes }
				data-mode={ orientation }>

				<Placeholder>
					<div className="image-compare__image-before">
						{ imageBeforeUrl ? (
							<img id={ imageBeforeId } src={ imageBeforeUrl } alt={ imageBeforeAlt } />
						) : (
							<>
								<div className="components-placeholder__label">{ __( 'Image Before' ) }</div>
								<UploadPlaceholder
									onSelect={
										( el ) => {
											setAttributes( {
												imageBeforeId: el.id,
												imageBeforeUrl: el.url,
												imageBeforeAlt: el.alt
											} );
											juxtapose.scanPage();
										}
									}
									allowedTypes={ [ 'image' ] }
									labels={ { title: __( 'First image to compare' ) } }
								/>
							</>
						) }
					</div>

					<div className="image-compare__image-after">
						{ imageAfterUrl ? (
							<img id={ imageAfterId } src={ imageAfterUrl } alt={ imageAfterAlt } />
						) : (
							<>
								<div className="components-placeholder__label">{ __( 'Image After' ) }</div>
								<UploadPlaceholder
									onSelect={
										( el ) => {
											setAttributes( {
												imageAfterId: el.id,
												imageAfterUrl: el.url,
												imageAfterAlt: el.alt
											} );
											juxtapose.scanPage();
										}
									}
									allowedTypes={ [ 'image' ] }
									labels={ { title: __( 'Second image to compare' ) } }
								/>
							</>
						) }
					</div>
				</Placeholder>
			</div>
			{ ( ! RichText.isEmpty( caption ) || isSelected && imageBeforeUrl && imageAfterUrl ) && (
				<RichText
					tagName="figcaption"
					placeholder={ __( 'Write caption' ) }
					value={ caption }
					onChange={ ( value ) =>
						setAttributes( { caption: value } )
					}
					// these are from image caption, do we need?
					//unstableOnFocus={ this.onFocusCaption }
					//isSelected={ this.state.captionFocused }
					inlineToolbar
				/>
			) }
		</figure>
	);
};

export default edit;
