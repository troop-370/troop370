import Renderer from '@cristata/prosemirror-to-html-js';
import type { DOMOutputSpec } from '@cristata/prosemirror-to-html-js/dist/Renderer';

interface PhotoWidgetAttrs {
  position?: string;
  showCaption?: boolean;
  photoCredit?: string;
  photoUrl: string;
}

class PhotoWidget extends Renderer.Node<PhotoWidgetAttrs> {
  matching(): boolean {
    return this.node.type === 'photoWidget';
  }
  toDOM(): DOMOutputSpec {
    const position: string = this.node.attrs?.position || 'center';

    if (this.node.attrs?.showCaption) {
      return [
        'figure',
        {
          class: `widget photo position-${position}`,
        },
        [
          'div',
          {
            class: 'img-wrapper',
            'data-photo-credit': '',
            style: '',
          },
          [
            'img',
            {
              src: this.node.attrs.photoUrl,
              alt: '',
            },
          ],
        ],
        [
          'figcaption',
          {
            'data-photo-credit': this.node.attrs.photoCredit || '',
            style: `
              display: block;
              text-align: center;
              margin: 10px 0 10px 0;
              color: #666;
              font-size: 90%;
              text-align: center;
            `,
          },
          0,
        ],
      ];
    }

    return [
      'figure',
      {
        class: `widget photo position-${position}`,
      },
      [
        'div',
        {
          class: 'img-wrapper',
          'data-photo-credit': this.node.attrs?.photoCredit || '',
          style: '',
        },
        [
          'img',
          {
            src: this.node.attrs?.photoUrl,
            alt: '',
          },
        ],
      ],
      [
        'figcaption',
        {
          'data-photo-credit': '',
          style: `
            display: block;
            text-align: right;
            margin: -26px 0 10px 0;
            color: #666;
            font-size: 90%;
            text-align: center;
          `,
        },
      ],
    ];
  }
}

export { PhotoWidget };
