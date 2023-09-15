(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    const tagsCollection = [];
    return this.each(function () {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox($(this), options.lightboxId, options.navigation);
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function (index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          const theTag = $(this).data("gallery-tag");
          if (options.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags($(this), options.tagsPosition, tagsCollection);
      }
      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function (options) {
    $(".gallery-item").on("click", function () {
      if (!options.lightBox || $(this).prop("tagName") !== "IMG") {
        return;
      }
      $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    $(".gallery").on("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        $.fn.mauGallery.methods.changeImage(false);
      } else if (e.key === "ArrowRight") {
        $.fn.mauGallery.methods.changeImage(true);
      }
    });
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.changeImage(false)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.changeImage(true)
    );

  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(`<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`);
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    changeImage(next) {
      let activeImage = null;
      for (const image of $("img.gallery-item")) {
        if ($(image).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = image;
        }
      }

      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = [];
      if (activeTag === "all") {
        for (const itemColumn of $(".item-column")) {
          if ($(itemColumn).children("img").length) {
            imagesCollection.push($(itemColumn).children("img"));
          }
        }
      } else {
        for (const itemColumn of $(".item-column")) {
          if ($(itemColumn).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(itemColumn).children("img"));
          }
        }
      }
      let index = 0;

      for (let i = 0; i < imagesCollection.length; i += 1) {
        if ($(activeImage).attr("src") === imagesCollection[i].attr("src")) {
          index = i;
        }
      }
      const img = imagesCollection[next ? index += 1 : index -= 1] || imagesCollection[next ? 0 : imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(img).attr("src"));
    },
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}"
       tabindex="-1" role="dialog" aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-body">
                          ${navigation
          ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
          : '<span style="display:none;" />'
        }
                          <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                          ${navigation
          ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
          : '<span style="display:none;" />'
        }
                      </div>
                  </div>
              </div>
          </div>`);
    },
    showItemTags(gallery, position, tags) {
      let tagItems = '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item active">
              <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      let tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      const tag = $(this).data("images-toggle");

      for (const galleryItem of $(".gallery-item")) {
        $(galleryItem)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(galleryItem)
            .parents(".item-column")
            .show(300);
        } else if ($(galleryItem).data("gallery-tag") === tag) {
          $(galleryItem)
            .parents(".item-column")
            .show(300);
        }
      }
    }
  };
})(jQuery);